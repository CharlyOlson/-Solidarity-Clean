/*
 * SOLIDARITY PLATFORM - SMART CONTRACT MANAGER
 * ==============================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 * 
 * ==============================================
 * 
 * Contract deployment, registration, and interaction — LIVE
 * Uses ethers.js v6 for real contract calls.
 * Gas estimation with phi safety margin (1.618x).
 */

const { ethers } = require('ethers');

class SmartContractManager {
  constructor(config = {}) {
    this.version = '2.0.0';
    this.baseRatio = 1.618;

    this.config = {
      testMode: config.testMode !== undefined ? config.testMode : true,
      gasSafetyMultiplier: config.gasSafetyMultiplier || 1.618 // phi ratio
    };

    this.provider = null;
    this.signer = null;
    this.chainId = null;

    // Contract registry: name -> { address, abi, contract (ethers.Contract instance) }
    this.contracts = new Map();

    // Gas metrics
    this.gasMetrics = {
      totalEstimated: 0n,
      totalUsed: 0n,
      callCount: 0,
      deployCount: 0
    };

    console.log('Smart Contract Manager v2.0.0 initialized (ethers.js v6)');
    console.log('Gas safety multiplier:', this.config.gasSafetyMultiplier + 'x (phi)');
  }

  /**
   * Connect to chain with a signer.
   */
  async connect(rpcUrl, privateKey) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    const network = await this.provider.getNetwork();
    this.chainId = Number(network.chainId);
    console.log('Connected. Chain:', this.chainId, 'Signer:', this.signer.address);
    return { success: true, chainId: this.chainId };
  }

  /**
   * Connect with an existing provider/signer.
   */
  connectWithSigner(provider, signer) {
    this.provider = provider;
    this.signer = signer;
  }

  /**
   * Register an already-deployed contract for interaction.
   */
  registerContract(name, address, abi) {
    if (!ethers.isAddress(address)) {
      return { success: false, error: 'Invalid contract address' };
    }

    const signerOrProvider = this.signer || this.provider;
    if (!signerOrProvider) {
      return { success: false, error: 'Connect to a provider first' };
    }

    const contract = new ethers.Contract(address, abi, signerOrProvider);
    this.contracts.set(name, { address, abi, contract });

    console.log('Registered contract:', name, 'at', address);
    return { success: true, name, address };
  }

  /**
   * Deploy a new contract.
   * @param {string} name - Name to register the deployed contract under
   * @param {string} abi - Contract ABI
   * @param {string} bytecode - Contract bytecode
   * @param {array} constructorArgs - Constructor arguments
   */
  async deployContract(name, abi, bytecode, constructorArgs = []) {
    if (!this.signer) {
      return { success: false, error: 'No signer connected' };
    }
    if (this.config.testMode && this.chainId === 1) {
      return { success: false, error: 'Test mode: mainnet deployment blocked' };
    }

    try {
      console.log('Deploying contract:', name, '...');

      const factory = new ethers.ContractFactory(abi, bytecode, this.signer);

      // Estimate gas with phi safety margin
      const deployTx = await factory.getDeployTransaction(...constructorArgs);
      const gasEstimate = await this.provider.estimateGas(deployTx);
      const safeGas = (gasEstimate * BigInt(Math.round(this.config.gasSafetyMultiplier * 1000))) / 1000n;

      console.log('  Gas estimate:', gasEstimate.toString(), '-> safe:', safeGas.toString());

      // Deploy
      const contract = await factory.deploy(...constructorArgs, { gasLimit: safeGas });
      const receipt = await contract.deploymentTransaction().wait(1);

      const addr = await contract.getAddress();
      console.log('  Deployed at:', addr, 'in block', receipt.blockNumber);

      // Register it
      this.contracts.set(name, { address: addr, abi, contract });
      this.gasMetrics.deployCount++;
      this.gasMetrics.totalEstimated += gasEstimate;
      this.gasMetrics.totalUsed += receipt.gasUsed;

      return {
        success: true,
        name,
        address: addr,
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      console.error('Deployment failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Call a read-only (view/pure) function on a registered contract.
   */
  async callView(contractName, functionName, args = []) {
    const entry = this.contracts.get(contractName);
    if (!entry) return { success: false, error: 'Contract not registered: ' + contractName };

    try {
      const result = await entry.contract[functionName](...args);
      this.gasMetrics.callCount++;

      return {
        success: true,
        contract: contractName,
        function: functionName,
        result: this.serializeResult(result)
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Call a state-changing (write) function on a registered contract.
   */
  async callWrite(contractName, functionName, args = [], options = {}) {
    const entry = this.contracts.get(contractName);
    if (!entry) return { success: false, error: 'Contract not registered: ' + contractName };
    if (!this.signer) return { success: false, error: 'No signer connected' };

    try {
      // Estimate gas
      const gasEstimate = await entry.contract[functionName].estimateGas(...args);
      const safeGas = (gasEstimate * BigInt(Math.round(this.config.gasSafetyMultiplier * 1000))) / 1000n;

      console.log('Calling', contractName + '.' + functionName,
        '| gas:', gasEstimate.toString(), '->', safeGas.toString());

      // Build tx options
      const txOptions = { gasLimit: safeGas };
      if (options.value) txOptions.value = ethers.parseEther(String(options.value));

      // Execute
      const tx = await entry.contract[functionName](...args, txOptions);
      const receipt = await tx.wait(1);

      this.gasMetrics.callCount++;
      this.gasMetrics.totalEstimated += gasEstimate;
      this.gasMetrics.totalUsed += receipt.gasUsed;

      console.log('  Confirmed in block', receipt.blockNumber, '| gas used:', receipt.gasUsed.toString());

      return {
        success: true,
        contract: contractName,
        function: functionName,
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };

    } catch (error) {
      console.error('Call failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Batch multiple view calls in parallel.
   */
  async batchView(calls) {
    // calls: [{ contract, function, args }]
    const results = await Promise.all(
      calls.map(c => this.callView(c.contract, c.function, c.args || []))
    );
    return results;
  }

  /**
   * Estimate gas for a contract function call.
   */
  async estimateGas(contractName, functionName, args = []) {
    const entry = this.contracts.get(contractName);
    if (!entry) return { success: false, error: 'Contract not registered' };

    try {
      const estimate = await entry.contract[functionName].estimateGas(...args);
      const safe = (estimate * BigInt(Math.round(this.config.gasSafetyMultiplier * 1000))) / 1000n;

      return {
        success: true,
        estimate: estimate.toString(),
        safeEstimate: safe.toString(),
        multiplier: this.config.gasSafetyMultiplier
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get a registered contract's ethers.Contract instance directly.
   */
  getContract(name) {
    const entry = this.contracts.get(name);
    return entry ? entry.contract : null;
  }

  /**
   * List all registered contracts.
   */
  listContracts() {
    const list = [];
    for (const [name, entry] of this.contracts) {
      list.push({ name, address: entry.address });
    }
    return list;
  }

  /**
   * Get gas metrics.
   */
  getGasMetrics() {
    const savings = this.gasMetrics.totalEstimated > 0n
      ? this.gasMetrics.totalEstimated - this.gasMetrics.totalUsed
      : 0n;

    return {
      deployCount: this.gasMetrics.deployCount,
      callCount: this.gasMetrics.callCount,
      totalEstimated: this.gasMetrics.totalEstimated.toString(),
      totalUsed: this.gasMetrics.totalUsed.toString(),
      gasSavings: savings.toString()
    };
  }

  // Serialize ethers results (BigInt, arrays, etc.) to plain JSON
  serializeResult(val) {
    if (typeof val === 'bigint') return val.toString();
    if (Array.isArray(val)) return val.map(v => this.serializeResult(v));
    if (typeof val === 'object' && val !== null) {
      const obj = {};
      for (const k of Object.keys(val)) {
        if (!isNaN(k)) continue; // skip numeric indices from Result
        obj[k] = this.serializeResult(val[k]);
      }
      return obj;
    }
    return val;
  }

  printStatusReport() {
    const m = this.getGasMetrics();
    console.log('\nSMART CONTRACT MANAGER v2.0.0');
    console.log('='.repeat(60));
    console.log('Chain ID:', this.chainId || 'Not connected');
    console.log('Signer:', this.signer ? this.signer.address : 'None');
    console.log('Registered contracts:', this.contracts.size);
    for (const [name, entry] of this.contracts) {
      console.log('  ', name, '->', entry.address);
    }
    console.log('Deploys:', m.deployCount, '| Calls:', m.callCount);
    console.log('Gas estimated:', m.totalEstimated, '| used:', m.totalUsed);
    console.log('='.repeat(60));
  }
}

module.exports = { SmartContractManager };

// Demo — reads TreasuryManager state
async function demo() {
  console.log('Smart Contract Manager v2.0.0 — Live Demo');
  console.log('='.repeat(60));

  const RPC = process.env.SEPOLIA_RPC_URL;
  const KEY = process.env.PRIVATE_KEY;
  if (!RPC || !KEY) {
    console.log('Set SEPOLIA_RPC_URL and PRIVATE_KEY to run the live demo.');
    return;
  }

  const scm = new SmartContractManager({ testMode: true });
  await scm.connect(RPC, KEY);

  // Register TreasuryManager
  const TREASURY = '0x362DC26b4b084778DB9525DF5A1d4A344C9E0C64';
  scm.registerContract('TreasuryManager', TREASURY, [
    'function scott() view returns (address)',
    'function hank() view returns (address)',
    'function classEquityRebuildFund() view returns (address)',
    'function infrastructureReserveSet() view returns (bool)',
    'function infrastructureReserveBP() view returns (uint256)',
    'function totalDistributed() view returns (uint256)',
    'function distributionCount() view returns (uint256)',
    'function owner() view returns (address)',
  ]);

  // Batch read
  console.log('\nReading TreasuryManager state...');
  const results = await scm.batchView([
    { contract: 'TreasuryManager', function: 'owner' },
    { contract: 'TreasuryManager', function: 'scott' },
    { contract: 'TreasuryManager', function: 'hank' },
    { contract: 'TreasuryManager', function: 'infrastructureReserveSet' },
    { contract: 'TreasuryManager', function: 'infrastructureReserveBP' },
    { contract: 'TreasuryManager', function: 'totalDistributed' },
    { contract: 'TreasuryManager', function: 'distributionCount' },
  ]);

  results.forEach(r => {
    if (r.success) console.log(' ', r.function + ':', r.result);
  });

  scm.printStatusReport();
}

if (require.main === module) {
  demo().catch(console.error);
}
