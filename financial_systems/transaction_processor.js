/*
 * SOLIDARITY PLATFORM - TRANSACTION PROCESSOR
 * =============================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 * 
 * =============================================
 * 
 * Transaction queue, validation, and confirmation — LIVE
 * Uses ethers.js v6 for real transaction submission and monitoring.
 */

const { ethers } = require('ethers');

class TransactionProcessor {
  constructor(config = {}) {
    this.version = '2.0.0';
    this.baseRatio = 1.618;

    this.config = {
      testMode: config.testMode !== undefined ? config.testMode : true,
      maxRetries: config.maxRetries || 3,
      confirmations: config.confirmations || 1,
      maxQueueSize: config.maxQueueSize || 100
    };

    this.provider = null;
    this.signer = null;
    this.chainId = null;

    // Transaction tracking
    this.queue = [];        // { id, tx, status, retries, createdAt }
    this.history = [];      // completed/failed transactions
    this.processing = false;

    // Metrics
    this.metrics = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      totalGasUsed: 0n,
      totalRetries: 0,
      averageConfirmationMs: 0
    };

    console.log('Transaction Processor v2.0.0 initialized (ethers.js v6)');
    console.log('Test Mode:', this.config.testMode ? 'ENABLED' : 'DISABLED');
  }

  /**
   * Connect to chain with a signer for sending transactions.
   */
  async connect(rpcUrl, privateKey) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    const network = await this.provider.getNetwork();
    this.chainId = Number(network.chainId);

    console.log('Connected. Chain:', this.chainId, 'Signer:', this.signer.address);
    return { success: true, chainId: this.chainId, address: this.signer.address };
  }

  /**
   * Connect with an existing signer (from WalletManager).
   */
  connectWithSigner(provider, signer) {
    this.provider = provider;
    this.signer = signer;
    console.log('Connected with external signer:', signer.address);
    return { success: true, address: signer.address };
  }

  /**
   * Submit a transaction for processing. Validates, queues, and processes.
   * @param {object} tx - { to, value (ETH), data (optional), gasLimit (optional) }
   */
  async processTransaction(transaction) {
    // Validate
    const validation = this.validateTransaction(transaction);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Generate ID and queue
    const id = this.generateTransactionId();
    const entry = {
      id,
      tx: { ...transaction },
      status: 'queued',
      retries: 0,
      hash: null,
      receipt: null,
      createdAt: Date.now(),
      completedAt: null
    };

    this.queue.push(entry);
    console.log('Queued transaction', id, 'to:', transaction.to);

    // Process immediately if not already processing
    if (!this.processing) {
      return this.processNext(id);
    }

    return { success: true, id, status: 'queued', position: this.queue.length };
  }

  /**
   * Process the next transaction in queue (or a specific one by ID).
   */
  async processNext(targetId = null) {
    if (!this.signer) {
      return { success: false, error: 'No signer connected' };
    }

    const entry = targetId
      ? this.queue.find(e => e.id === targetId)
      : this.queue.find(e => e.status === 'queued');

    if (!entry) {
      return { success: false, error: 'No transactions to process' };
    }

    this.processing = true;
    entry.status = 'processing';

    try {
      // Build ethers transaction
      const ethTx = {
        to: entry.tx.to,
        value: entry.tx.value ? ethers.parseEther(String(entry.tx.value)) : 0n
      };
      if (entry.tx.data) ethTx.data = entry.tx.data;
      if (entry.tx.gasLimit) ethTx.gasLimit = BigInt(entry.tx.gasLimit);

      // Send
      console.log('Sending transaction', entry.id, '...');
      const startTime = Date.now();
      const txResponse = await this.signer.sendTransaction(ethTx);
      entry.hash = txResponse.hash;
      entry.status = 'pending';
      console.log('  Broadcast:', entry.hash);

      // Wait for confirmation
      const receipt = await txResponse.wait(this.config.confirmations);
      const elapsed = Date.now() - startTime;

      entry.status = receipt.status === 1 ? 'confirmed' : 'reverted';
      entry.receipt = {
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.gasPrice ? receipt.gasPrice.toString() : null,
        status: receipt.status
      };
      entry.completedAt = Date.now();

      // Move to history
      this.queue = this.queue.filter(e => e.id !== entry.id);
      this.history.push(entry);

      // Update metrics
      this.metrics.totalProcessed++;
      if (receipt.status === 1) {
        this.metrics.successful++;
        this.metrics.totalGasUsed += receipt.gasUsed;
      } else {
        this.metrics.failed++;
      }
      this.updateAverageConfirmationTime(elapsed);

      console.log('  ' + entry.status.toUpperCase(), 'in block', receipt.blockNumber,
        '(' + (elapsed / 1000).toFixed(1) + 's)');

      this.processing = false;
      return {
        success: true,
        id: entry.id,
        hash: entry.hash,
        status: entry.status,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        elapsedMs: elapsed
      };

    } catch (error) {
      entry.retries++;
      this.metrics.totalRetries++;
      console.error('  Transaction failed:', error.message);

      if (entry.retries < this.config.maxRetries) {
        entry.status = 'queued'; // Re-queue for retry
        console.log('  Retry', entry.retries, '/', this.config.maxRetries);
        this.processing = false;
        return this.processNext(entry.id);
      }

      // Max retries exceeded
      entry.status = 'failed';
      entry.error = error.message;
      entry.completedAt = Date.now();
      this.queue = this.queue.filter(e => e.id !== entry.id);
      this.history.push(entry);
      this.metrics.totalProcessed++;
      this.metrics.failed++;
      this.processing = false;

      return { success: false, id: entry.id, status: 'failed', error: error.message };
    }
  }

  /**
   * Process all queued transactions sequentially.
   */
  async processAll() {
    const results = [];
    while (this.queue.some(e => e.status === 'queued')) {
      const result = await this.processNext();
      results.push(result);
    }
    return results;
  }

  /**
   * Validate a transaction before queuing.
   */
  validateTransaction(tx) {
    if (!tx.to) return { valid: false, error: 'Missing "to" address' };
    if (!ethers.isAddress(tx.to)) return { valid: false, error: 'Invalid "to" address' };
    if (tx.value !== undefined && tx.value !== null) {
      const val = parseFloat(tx.value);
      if (isNaN(val) || val < 0) return { valid: false, error: 'Invalid value' };
    }
    if (this.config.testMode && this.chainId === 1) {
      return { valid: false, error: 'Test mode: mainnet transactions blocked' };
    }
    if (this.queue.length >= this.config.maxQueueSize) {
      return { valid: false, error: 'Queue full' };
    }
    return { valid: true };
  }

  /**
   * Get transaction status by ID.
   */
  getTransactionStatus(id) {
    const queued = this.queue.find(e => e.id === id);
    if (queued) return { ...queued };

    const historical = this.history.find(e => e.id === id);
    if (historical) return { ...historical };

    return { error: 'Transaction not found' };
  }

  /**
   * Get transaction history with optional filters.
   */
  getTransactionHistory(filter = {}) {
    let results = [...this.history];

    if (filter.status) {
      results = results.filter(e => e.status === filter.status);
    }
    if (filter.to) {
      results = results.filter(e => e.tx.to.toLowerCase() === filter.to.toLowerCase());
    }
    if (filter.since) {
      results = results.filter(e => e.createdAt >= filter.since);
    }

    return results;
  }

  /**
   * Cancel a queued (not yet sent) transaction.
   */
  cancelTransaction(id) {
    const idx = this.queue.findIndex(e => e.id === id && e.status === 'queued');
    if (idx === -1) {
      return { success: false, error: 'Transaction not found or already processing' };
    }

    const entry = this.queue.splice(idx, 1)[0];
    entry.status = 'cancelled';
    entry.completedAt = Date.now();
    this.history.push(entry);

    return { success: true, id, status: 'cancelled' };
  }

  // Internal helpers
  updateAverageConfirmationTime(newTime) {
    const n = this.metrics.successful;
    this.metrics.averageConfirmationMs =
      ((this.metrics.averageConfirmationMs * (n - 1)) + newTime) / n;
  }

  generateTransactionId() {
    return 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  }

  getMetrics() {
    return {
      totalProcessed: this.metrics.totalProcessed,
      successful: this.metrics.successful,
      failed: this.metrics.failed,
      totalGasUsed: this.metrics.totalGasUsed.toString(),
      totalRetries: this.metrics.totalRetries,
      averageConfirmationMs: Math.round(this.metrics.averageConfirmationMs),
      queueLength: this.queue.length,
      successRate: this.metrics.totalProcessed > 0
        ? (this.metrics.successful / this.metrics.totalProcessed * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  printStatusReport() {
    const m = this.getMetrics();
    console.log('\nTRANSACTION PROCESSOR v2.0.0');
    console.log('='.repeat(60));
    console.log('Chain ID:', this.chainId || 'Not connected');
    console.log('Signer:', this.signer ? this.signer.address : 'None');
    console.log('Queue:', m.queueLength, '| Processed:', m.totalProcessed);
    console.log('Success:', m.successful, '| Failed:', m.failed, '| Rate:', m.successRate);
    console.log('Gas used:', m.totalGasUsed, '| Retries:', m.totalRetries);
    console.log('Avg confirm:', m.averageConfirmationMs, 'ms');
    console.log('='.repeat(60));
  }
}

module.exports = { TransactionProcessor };

// Demo
async function demo() {
  console.log('Transaction Processor v2.0.0 — Live Demo');
  console.log('='.repeat(60));

  const RPC = process.env.SEPOLIA_RPC_URL;
  const KEY = process.env.PRIVATE_KEY;
  if (!RPC || !KEY) {
    console.log('Set SEPOLIA_RPC_URL and PRIVATE_KEY to run the live demo.');
    return;
  }

  const tp = new TransactionProcessor({ testMode: true, confirmations: 1 });
  await tp.connect(RPC, KEY);

  // Send a small self-transfer to test
  console.log('\nSending 0.0001 ETH self-transfer...');
  const result = await tp.processTransaction({
    to: tp.signer.address,
    value: '0.0001'
  });
  console.log('Result:', JSON.stringify(result, null, 2));

  tp.printStatusReport();
}

if (require.main === module) {
  demo().catch(console.error);
}
