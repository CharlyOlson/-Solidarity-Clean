/*
 * SOLIDARITY PLATFORM - BLOCKCHAIN CONNECTOR
 * ===========================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Status: Architect of Model System
 * Documentation: iPhone ✓ Electric Passport ✓ GitHub Copilot Chat (First Run) ✓
 * Timestamp: 2025-10-08 18:20:30 UTC
 * Repository: https://github.com/CharlyOlson/-Solidarity-Clean
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 * 
 * ===========================================
 * 
 * Blockchain Network Integration — LIVE
 * Multi-chain support (Ethereum Sepolia, extensible)
 * Base ratio (φ = 1.618) baseline for all operations
 * 
 * Uses ethers.js v6 for real chain interaction.
 */

const { ethers } = require('ethers');

class BlockchainConnector {
  constructor(config = {}) {
    this.version = '2.0.0';
    this.baseRatio = 1.618;
    this.bridgingBaseline = 0.618;

    // Connection configuration
    this.config = {
      network: config.network || 'ethereum',
      environment: config.environment || 'testnet',
      testMode: config.testMode !== undefined ? config.testMode : true,
      autoReconnect: config.autoReconnect !== undefined ? config.autoReconnect : true,
      reconnectDelay: config.reconnectDelay || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 3,
      rpcUrl: config.rpcUrl || null,
      privateKey: config.privateKey || null
    };

    // Connection state
    this.connected = false;
    this.provider = null;
    this.signer = null;
    this.chainId = null;
    this.blockNumber = null;

    // Transaction tracking
    this.pendingTransactions = new Map();
    this.transactionHistory = [];

    // Authentication and security
    this.authenticated = false;
    this.walletAddress = null;

    // Metrics
    this.metrics = {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      totalGasUsed: 0n,
      connectionAttempts: 0,
      lastConnectionTime: null
    };

    console.log('🔗 Blockchain Connector v2.0.0 initialized (ethers.js v6)');
    console.log(`🌐 Network: ${this.config.network} (${this.config.environment})`);
    console.log(`🧪 Test Mode: ${this.config.testMode ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Connect to blockchain network via RPC.
   * @param {string} rpcUrl — Alchemy/Infura/local RPC endpoint
   * @returns {object} Connection result with chainId, blockNumber
   */
  async connect(rpcUrl) {
    const url = rpcUrl || this.config.rpcUrl;
    if (!url) {
      return { success: false, error: 'No RPC URL provided' };
    }

    try {
      this.metrics.connectionAttempts++;
      console.log(`🔌 Connecting to ${this.config.network} via ${url.substring(0, 40)}...`);

      // Real ethers.js provider
      this.provider = new ethers.JsonRpcProvider(url);

      // Verify connection by fetching network info
      const network = await this.provider.getNetwork();
      this.chainId = Number(network.chainId);
      this.blockNumber = await this.provider.getBlockNumber();

      this.connected = true;
      this.config.rpcUrl = url;
      this.metrics.lastConnectionTime = new Date().toISOString();

      console.log('✅ Connected to blockchain network');
      console.log(`⛓️  Chain ID: ${this.chainId}`);
      console.log(`📦 Current Block: ${this.blockNumber}`);

      return {
        success: true,
        network: this.config.network,
        chainId: this.chainId,
        blockNumber: this.blockNumber,
        timestamp: this.metrics.lastConnectionTime
      };

    } catch (error) {
      console.error('❌ Connection failed:', error.message);

      if (this.config.autoReconnect && this.metrics.connectionAttempts < this.config.maxReconnectAttempts) {
        console.log(`🔄 Attempting reconnection in ${this.config.reconnectDelay}ms...`);
        await this.delay(this.config.reconnectDelay);
        return this.connect(url);
      }

      return {
        success: false,
        error: error.message,
        attempts: this.metrics.connectionAttempts
      };
    }
  }

  /**
   * Authenticate with a private key — creates a Wallet signer.
   * @param {object} credentials — { privateKey } or { address, signature } for read-only
   * @returns {object} Auth result with wallet address
   */
  async authenticate(credentials) {
    if (!this.connected || !this.provider) {
      return { success: false, error: 'Not connected. Call connect() first.' };
    }

    try {
      console.log('🔐 Authenticating...');

      if (credentials.privateKey) {
        // Full write access — wallet signer
        this.signer = new ethers.Wallet(credentials.privateKey, this.provider);
        this.walletAddress = this.signer.address;
        this.authenticated = true;

        console.log('✅ Wallet authenticated (read + write)');
        console.log(`📍 Address: ${this.walletAddress}`);
      } else if (credentials.address) {
        // Read-only mode
        this.walletAddress = credentials.address;
        this.authenticated = true;

        console.log('✅ Read-only authentication');
        console.log(`📍 Address: ${this.walletAddress}`);
      } else {
        return { success: false, error: 'Provide privateKey or address' };
      }

      return {
        success: true,
        authenticated: true,
        address: this.walletAddress,
        hasWriteAccess: !!this.signer
      };

    } catch (error) {
      console.error('❌ Authentication failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Disconnect from network. Clears provider and signer.
   */
  async disconnect() {
    if (!this.connected) {
      console.log('⚠️  Not connected to any network');
      return { success: true };
    }

    console.log('🔌 Disconnecting from blockchain network...');

    if (this.provider && typeof this.provider.destroy === 'function') {
      this.provider.destroy();
    }

    this.connected = false;
    this.provider = null;
    this.signer = null;
    this.authenticated = false;
    this.walletAddress = null;

    console.log('✅ Disconnected successfully');
    return { success: true };
  }

  /**
   * Send a real transaction on-chain.
   * Requires authentication with a private key.
   * @param {object} transaction — { to, value (in ETH), data (optional), gasLimit (optional) }
   * @returns {object} Transaction result with hash
   */
  async sendTransaction(transaction) {
    if (!this.connected) {
      throw new Error('Not connected to blockchain network');
    }
    if (!this.signer) {
      throw new Error('No signer. Authenticate with a private key first.');
    }
    if (this.config.testMode && this.chainId === 1) {
      throw new Error('Test mode enabled — cannot send mainnet (chainId 1) transactions');
    }

    console.log('📤 Sending transaction...');
    console.log(`   To: ${transaction.to}`);
    console.log(`   Value: ${transaction.value || 0} ETH`);

    try {
      // Build the transaction
      const tx = {
        to: transaction.to,
        value: transaction.value ? ethers.parseEther(String(transaction.value)) : 0n
      };

      if (transaction.data) {
        tx.data = transaction.data;
      }
      if (transaction.gasLimit) {
        tx.gasLimit = BigInt(transaction.gasLimit);
      }

      // Send it
      const txResponse = await this.signer.sendTransaction(tx);
      const txHash = txResponse.hash;

      console.log(`📨 Transaction broadcast: ${txHash}`);

      // Track it
      this.pendingTransactions.set(txHash, {
        hash: txHash,
        to: transaction.to,
        value: transaction.value || 0,
        status: 'pending',
        timestamp: Date.now()
      });

      this.metrics.totalTransactions++;

      return {
        success: true,
        hash: txHash,
        status: 'pending',
        timestamp: Date.now(),
        // Caller can await this for confirmation
        wait: () => this.waitForConfirmation(txHash, txResponse)
      };

    } catch (error) {
      this.metrics.failedTransactions++;
      console.error('❌ Transaction failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Wait for a transaction to be mined and confirmed.
   * @param {string} txHash
   * @param {object} txResponse — ethers TransactionResponse
   * @param {number} confirmations — number of confirmations to wait for (default 1)
   * @returns {object} Receipt with gas used, block number
   */
  async waitForConfirmation(txHash, txResponse, confirmations = 1) {
    try {
      console.log(`⏳ Waiting for ${confirmations} confirmation(s)...`);

      const receipt = await txResponse.wait(confirmations);

      const result = {
        hash: txHash,
        status: receipt.status === 1 ? 'confirmed' : 'reverted',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.gasPrice ? receipt.gasPrice.toString() : null,
        confirmations
      };

      // Update tracking
      this.pendingTransactions.delete(txHash);
      this.transactionHistory.push(result);

      if (receipt.status === 1) {
        this.metrics.successfulTransactions++;
        this.metrics.totalGasUsed += receipt.gasUsed;
        console.log(`✅ Confirmed in block ${receipt.blockNumber} (gas: ${receipt.gasUsed})`);
      } else {
        this.metrics.failedTransactions++;
        console.log(`❌ Transaction reverted in block ${receipt.blockNumber}`);
      }

      return result;

    } catch (error) {
      console.error('❌ Confirmation error:', error.message);
      return { hash: txHash, status: 'error', error: error.message };
    }
  }

  /**
   * Get real ETH balance for an address.
   * @param {string} address — Ethereum address (defaults to authenticated wallet)
   * @returns {object} Balance in ETH and Wei
   */
  async getBalance(address) {
    if (!this.connected || !this.provider) {
      throw new Error('Not connected to blockchain network');
    }

    const addr = address || this.walletAddress;
    if (!addr) {
      throw new Error('No address provided and no wallet authenticated');
    }

    console.log(`💰 Fetching balance for ${addr.substring(0, 10)}...`);

    const balanceWei = await this.provider.getBalance(addr);
    const balanceEth = ethers.formatEther(balanceWei);

    console.log(`   Balance: ${balanceEth} ETH`);

    return {
      address: addr,
      balanceWei: balanceWei.toString(),
      balance: parseFloat(balanceEth),
      unit: 'ETH',
      timestamp: Date.now()
    };
  }

  /**
   * Get current block number from the chain.
   */
  async getCurrentBlock() {
    if (!this.connected || !this.provider) {
      throw new Error('Not connected to blockchain network');
    }

    this.blockNumber = await this.provider.getBlockNumber();

    return {
      blockNumber: this.blockNumber,
      timestamp: Date.now()
    };
  }

  /**
   * Get full block details.
   * @param {number|string} blockTag — block number or 'latest'
   */
  async getBlock(blockTag = 'latest') {
    if (!this.connected || !this.provider) {
      throw new Error('Not connected to blockchain network');
    }

    const block = await this.provider.getBlock(blockTag);
    return {
      number: block.number,
      hash: block.hash,
      timestamp: block.timestamp,
      gasUsed: block.gasUsed.toString(),
      gasLimit: block.gasLimit.toString(),
      transactionCount: block.transactions.length
    };
  }

  /**
   * Get transaction receipt from the chain.
   * @param {string} txHash
   */
  async getTransactionReceipt(txHash) {
    if (!this.connected || !this.provider) {
      throw new Error('Not connected to blockchain network');
    }

    const receipt = await this.provider.getTransactionReceipt(txHash);
    if (!receipt) {
      return { error: 'Transaction not found or not yet mined' };
    }

    return {
      hash: receipt.hash,
      status: receipt.status === 1 ? 'confirmed' : 'reverted',
      blockNumber: receipt.blockNumber,
      from: receipt.from,
      to: receipt.to,
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.gasPrice ? receipt.gasPrice.toString() : null
    };
  }

  /**
   * Estimate gas for a transaction.
   * @param {object} tx — { to, value, data }
   */
  async estimateGas(tx) {
    if (!this.connected || !this.provider) {
      throw new Error('Not connected to blockchain network');
    }

    const estimate = await this.provider.estimateGas({
      to: tx.to,
      value: tx.value ? ethers.parseEther(String(tx.value)) : 0n,
      data: tx.data || '0x'
    });

    // Apply phi safety margin (1.618x)
    const safeEstimate = (estimate * 1618n) / 1000n;

    return {
      estimate: estimate.toString(),
      safeEstimate: safeEstimate.toString(),
      safetyMultiplier: this.baseRatio
    };
  }

  /**
   * Get current gas price from the network.
   */
  async getGasPrice() {
    if (!this.connected || !this.provider) {
      throw new Error('Not connected to blockchain network');
    }

    const feeData = await this.provider.getFeeData();

    return {
      gasPrice: feeData.gasPrice ? feeData.gasPrice.toString() : null,
      maxFeePerGas: feeData.maxFeePerGas ? feeData.maxFeePerGas.toString() : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? feeData.maxPriorityFeePerGas.toString() : null,
      gasPriceGwei: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : null
    };
  }

  /**
   * Get transaction status — checks pending map, history, then chain.
   */
  async getTransactionStatus(txHash) {
    // Check local pending
    if (this.pendingTransactions.has(txHash)) {
      return this.pendingTransactions.get(txHash);
    }

    // Check local history
    const historical = this.transactionHistory.find(tx => tx.hash === txHash);
    if (historical) {
      return historical;
    }

    // Check chain
    if (this.connected && this.provider) {
      return this.getTransactionReceipt(txHash);
    }

    return { error: 'Transaction not found' };
  }

  /**
   * Create a contract instance for interaction.
   * @param {string} address — deployed contract address
   * @param {array} abi — contract ABI
   * @returns {ethers.Contract} Connected contract instance
   */
  getContract(address, abi) {
    if (!this.connected || !this.provider) {
      throw new Error('Not connected to blockchain network');
    }

    const signerOrProvider = this.signer || this.provider;
    return new ethers.Contract(address, abi, signerOrProvider);
  }

  /**
   * Get connection status summary.
   */
  getConnectionStatus() {
    return {
      connected: this.connected,
      network: this.config.network,
      environment: this.config.environment,
      chainId: this.chainId,
      blockNumber: this.blockNumber,
      authenticated: this.authenticated,
      walletAddress: this.walletAddress,
      hasWriteAccess: !!this.signer,
      testMode: this.config.testMode,
      pendingTransactions: this.pendingTransactions.size,
      metrics: this.getMetrics()
    };
  }

  /**
   * Get metrics summary.
   */
  getMetrics() {
    return {
      totalTransactions: this.metrics.totalTransactions,
      successfulTransactions: this.metrics.successfulTransactions,
      failedTransactions: this.metrics.failedTransactions,
      totalGasUsed: this.metrics.totalGasUsed.toString(),
      connectionAttempts: this.metrics.connectionAttempts,
      lastConnectionTime: this.metrics.lastConnectionTime,
      successRate: this.metrics.totalTransactions > 0
        ? (this.metrics.successfulTransactions / this.metrics.totalTransactions * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  // Utility
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Print full status report to console.
   */
  printStatusReport() {
    const status = this.getConnectionStatus();
    const metrics = status.metrics;

    console.log('\n🔗 BLOCKCHAIN CONNECTOR v2.0.0 STATUS');
    console.log('='.repeat(60));
    console.log(`🌐 Network: ${status.network} (${status.environment})`);
    console.log(`🔌 Connected: ${status.connected ? '✅ YES' : '❌ NO'}`);
    console.log(`🔐 Authenticated: ${status.authenticated ? '✅ YES' : '❌ NO'}`);
    console.log(`✍️  Write Access: ${status.hasWriteAccess ? '✅ YES' : '❌ NO (read-only)'}`);
    console.log(`🧪 Test Mode: ${status.testMode ? 'ENABLED' : 'DISABLED'}`);

    if (status.connected) {
      console.log(`⛓️  Chain ID: ${status.chainId}`);
      console.log(`📦 Block Number: ${status.blockNumber}`);
    }

    if (status.walletAddress) {
      console.log(`📍 Wallet: ${status.walletAddress}`);
    }

    console.log('\n📊 METRICS:');
    console.log(`  Total Transactions: ${metrics.totalTransactions}`);
    console.log(`  Successful: ${metrics.successfulTransactions}`);
    console.log(`  Failed: ${metrics.failedTransactions}`);
    console.log(`  Success Rate: ${metrics.successRate}`);
    console.log(`  Total Gas Used: ${metrics.totalGasUsed}`);
    console.log(`  Connection Attempts: ${metrics.connectionAttempts}`);

    if (status.pendingTransactions > 0) {
      console.log(`\n⏳ Pending Transactions: ${status.pendingTransactions}`);
    }

    console.log('='.repeat(60));

    return status;
  }
}

// Export
module.exports = { BlockchainConnector };

// Demo — connects to real Sepolia
async function demo() {
  console.log('🚀 Blockchain Connector v2.0.0 — Live Demo');
  console.log('TRADEMARK: Scott Charles Olson');
  console.log('='.repeat(60));

  const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.ALCHEMY_RPC_URL;
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!RPC_URL) {
    console.log('Set SEPOLIA_RPC_URL or ALCHEMY_RPC_URL to run the live demo.');
    console.log('Example: SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY node blockchain_connector.js');
    return;
  }

  const connector = new BlockchainConnector({
    network: 'ethereum',
    environment: 'testnet',
    testMode: true
  });

  // Connect
  console.log('\n🔌 Connecting to Sepolia...');
  const conn = await connector.connect(RPC_URL);
  if (!conn.success) {
    console.log('Connection failed:', conn.error);
    return;
  }

  // Authenticate (read-only if no key, full if key provided)
  if (PRIVATE_KEY) {
    await connector.authenticate({ privateKey: PRIVATE_KEY });
  } else {
    await connector.authenticate({ address: '0x5A6BE7b05d6DEFf4788DDBf138e1b8E5B16Fb3bc' });
  }

  // Balance check
  console.log('\n💰 Checking deployer balance...');
  const balance = await connector.getBalance();
  console.log(`   ${balance.balance} ETH`);

  // Gas price
  console.log('\n⛽ Current gas price:');
  const gas = await connector.getGasPrice();
  console.log(`   ${gas.gasPriceGwei} Gwei`);

  // Block info
  console.log('\n📦 Latest block:');
  const block = await connector.getBlock('latest');
  console.log(`   #${block.number} — ${block.transactionCount} txns — gas: ${block.gasUsed}`);

  // Full status
  connector.printStatusReport();

  // Disconnect
  await connector.disconnect();
}

if (require.main === module) {
  demo().catch(console.error);
}
