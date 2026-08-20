/*
 * SOLIDARITY FINANCIAL SYSTEM — Unified Entry Point
 * ===================================================
 * 
 * Boots the entire financial system from a single require/import.
 * 
 * Usage:
 *   const solidarity = require('./financial_systems');
 *   await solidarity.boot({ rpcUrl, privateKey });
 *   
 *   // Now everything is connected:
 *   solidarity.wallet.getBalance('deployer');
 *   solidarity.contracts.callView('TreasuryManager', 'distributionCount');
 *   solidarity.processor.processTransaction({ to, value });
 * 
 * Owner: Scott Charles Olson
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const { BlockchainConnector } = require('./blockchain_connector');
const { WalletManager } = require('./wallet_manager');
const { TransactionProcessor } = require('./transaction_processor');
const { SmartContractManager } = require('./smart_contract_manager');
const { FinancialOptimizer } = require('./financial_optimizer');
const { FinancialConfiguration } = require('./financial_config');
const CoreMathematicsEngine = require('../src/utils/CoreMathematicsEngine');
const { BridgingSafetyCoordinator } = require('../src/safety/BridgingSafetyCoordinator');
const { ThreeBodyCoherence } = require('../src/core/ThreeBodyCoherence');

// ── Triangle Network / Market Projection ──────────────────────
const entityRegistry      = require('./entity_registry');
const { seed: seedMarket }   = require('./market_entities');
const pythagoreanBalancer = require('./pythagorean_balancer');
const { computeTriangle } = require('./three_point_connector');
const { buildNetwork, toRenderableGraph, printReport } = require('./triangle_network');
const { project, printProjection } = require('./projection_engine');
const { runStressTest }   = require('./market_stress_test');
const { runMarketWeeklyForecast, printForecastReport } = require('./market_weekly_forecast');

/**
 * Run a full market projection for any registered entity.
 * Seeds IBM ecosystem data automatically on first call.
 *
 * @param {string} entityId   – e.g. 'ibm', 'microsoft', 'intel'
 * @param {object} [opts]
 * @param {number}             [opts.maxDepth=7]
 * @param {number}             [opts.maxRecursion=49]
 * @param {Map<string,number>} [opts.overrides]
 * @param {number}             [opts.safetyLevel=0.618]
 * @param {boolean}            [opts.print=true]
 * @param {boolean}            [opts.stress=false]  run stress test phases
 * @returns {object}  { projection, graph, stressResults? }
 */
function runMarketProjection(entityId, opts = {}) {
  // Auto-seed IBM ecosystem if not yet loaded
  if (!entityRegistry.has('ibm')) seedMarket();

  const print  = opts.print  !== undefined ? opts.print  : true;
  const stress = opts.stress !== undefined ? opts.stress : false;

  const projection = project(entityId, opts);
  const network    = buildNetwork(entityId, opts);
  const graph      = toRenderableGraph(network);

  if (print) {
    printReport(network);
    printProjection(projection);
  }

  const result = { projection, graph };

  if (stress) {
    const stressResults = runStressTest(entityId, {
      maxDepth:    opts.maxDepth,
      safetyLevel: opts.safetyLevel,
      verbose:     print,
    });
    result.stressResults = stressResults;
  }

  return result;
}

// TreasuryManager ABI — all public functions
const TREASURY_ABI = [
  // View functions
  'function scott() view returns (address)',
  'function hank() view returns (address)',
  'function hankChoice1() view returns (address)',
  'function hankChoice2() view returns (address)',
  'function hankChoice3() view returns (address)',
  'function hankChoice4() view returns (address)',
  'function hankCause1() view returns (address)',
  'function hankCause2() view returns (address)',
  'function hankCause3() view returns (address)',
  'function scottsMotherAddr() view returns (address)',
  'function sophieJones() view returns (address)',
  'function mariah() view returns (address)',
  'function colombiaFund() view returns (address)',
  'function openSlotA() view returns (address)',
  'function openSlotB() view returns (address)',
  'function infrastructureReserve() view returns (address)',
  'function classEquityRebuildFund() view returns (address)',
  'function infrastructureReserveBP() view returns (uint256)',
  'function infrastructureReserveSet() view returns (bool)',
  'function totalDistributed() view returns (uint256)',
  'function distributionCount() view returns (uint256)',
  'function owner() view returns (address)',
  'function BP_DENOMINATOR() view returns (uint256)',
  // Write functions
  'function distribute() payable',
  'function setInfrastructureReserveBP(uint256 _bp)',
  'function setHankChoices(address _c1, address _c2, address _c3, address _c4)',
  'function setHankCauses(address _cause1, address _cause2, address _cause3)',
  'function setNamedSlots(address _scottsMother, address _sophieJones, address _mariah, address _colombia)',
  'function setOpenSlots(address _slotA, address _slotB)',
  'function flushAccumulated(address recipient)',
  // Events
  'event RevenueDistributed(uint256 indexed distributionId, uint256 totalAmount, uint256 classEquityAmount, uint256 timestamp)',
  'event SlotAddressUpdated(string slotName, address newAddress)',
  'event InfrastructureReserveSized(uint256 basisPoints)',
];

// Default: deployed contracts on Sepolia
const TREASURY_ADDRESS = '0x362DC26b4b084778DB9525DF5A1d4A344C9E0C64';
const TOKEN_ADDRESS = '0xe12A8C0386429Eb6Db0101c358A8cc4b10e09d86';

// SolidarityToken ABI
const TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function coherenceScore() view returns (uint256)',
  'function getCoherenceLevel() view returns (string)',
  'function getCoherenceHistoryLength() view returns (uint256)',
  'function treasuryManager() view returns (address)',
  'function coherenceGatingEnabled() view returns (bool)',
  'function updateCoherence(uint256,uint256,uint256,uint256)',
  'function setCoherenceGating(bool)',
  'function CRITICAL_THRESHOLD() view returns (uint256)',
  'function STABLE_THRESHOLD() view returns (uint256)',
  'function ELEVATED_THRESHOLD() view returns (uint256)',
];

class SolidarityFinancialSystem {
  constructor() {
    this.version = '2.0.0';
    this.booted = false;

    // Core math, safety, and coherence
    this.math = new CoreMathematicsEngine();
    this.safety = new BridgingSafetyCoordinator();
    this.coherence = new ThreeBodyCoherence({
      math: this.math,
      safety: this.safety
    });

    // Financial modules (initialized but not connected)
    this.blockchain = new BlockchainConnector({ testMode: true });
    this.wallet = new WalletManager({ testMode: true });
    this.processor = new TransactionProcessor({ testMode: true });
    this.contracts = new SmartContractManager({ testMode: true });
    this.optimizer = new FinancialOptimizer();
    this.config = new FinancialConfiguration();
  }

  /**
   * Boot the entire financial system.
   * Connects to chain, sets up wallet, registers TreasuryManager.
   * 
   * @param {object} opts
   * @param {string} opts.rpcUrl — Alchemy/Infura RPC endpoint
   * @param {string} opts.privateKey — Deployer/owner private key
   * @param {string} opts.treasuryAddress — Override TreasuryManager address
   */
  async boot(opts = {}) {
    const rpcUrl = opts.rpcUrl || process.env.SEPOLIA_RPC_URL || process.env.ALCHEMY_RPC_URL;
    const privateKey = opts.privateKey || process.env.PRIVATE_KEY;
    const treasuryAddr = opts.treasuryAddress || TREASURY_ADDRESS;

    if (!rpcUrl) throw new Error('No RPC URL. Set SEPOLIA_RPC_URL or pass rpcUrl.');
    if (!privateKey) throw new Error('No private key. Set PRIVATE_KEY or pass privateKey.');

    console.log('='.repeat(60));
    console.log('SOLIDARITY FINANCIAL SYSTEM v2.0.0 — Booting');
    console.log('='.repeat(60));

    // 1. Connect blockchain
    const conn = await this.blockchain.connect(rpcUrl);
    if (!conn.success) throw new Error('Blockchain connection failed: ' + conn.error);

    // 2. Authenticate
    await this.blockchain.authenticate({ privateKey });

    // 3. Connect wallet manager
    await this.wallet.connectProvider(rpcUrl);
    this.wallet.importWallet('deployer', privateKey);

    // 4. Connect transaction processor
    await this.processor.connect(rpcUrl, privateKey);

    // 5. Connect smart contract manager + register TreasuryManager
    await this.contracts.connect(rpcUrl, privateKey);
    this.contracts.registerContract('TreasuryManager', treasuryAddr, TREASURY_ABI);

    // Register SolidarityToken (SLDRT)
    const tokenAddr = opts.tokenAddress || TOKEN_ADDRESS;
    this.contracts.registerContract('SolidarityToken', tokenAddr, TOKEN_ABI);

    this.booted = true;

    // Read initial state
    const state = await this.getTreasuryState();

    // Initialize coherence with current state
    this.coherence.calculate();

    console.log('\n--- System Ready ---');
    console.log('Chain ID:', conn.chainId);
    console.log('Block:', conn.blockNumber);
    console.log('Wallet:', this.blockchain.walletAddress);
    console.log('Treasury:', treasuryAddr);
    console.log('Infra Reserve:', state.infrastructureReserveBP + ' BP');
    console.log('Distributions:', state.distributionCount);
    console.log('Total Distributed:', state.totalDistributed);
    console.log('Coherence:', this.coherence.getScore().toFixed(4),
      '(' + this.coherence.getLevel() + ')');
    console.log('Token:', tokenAddr);
    console.log('='.repeat(60));

    return { success: true, chainId: conn.chainId, state };
  }

  /**
   * Read full TreasuryManager state.
   */
  async getTreasuryState() {
    const results = await this.contracts.batchView([
      { contract: 'TreasuryManager', function: 'owner' },
      { contract: 'TreasuryManager', function: 'scott' },
      { contract: 'TreasuryManager', function: 'hank' },
      { contract: 'TreasuryManager', function: 'hankChoice1' },
      { contract: 'TreasuryManager', function: 'hankChoice2' },
      { contract: 'TreasuryManager', function: 'hankChoice3' },
      { contract: 'TreasuryManager', function: 'hankChoice4' },
      { contract: 'TreasuryManager', function: 'hankCause1' },
      { contract: 'TreasuryManager', function: 'hankCause2' },
      { contract: 'TreasuryManager', function: 'hankCause3' },
      { contract: 'TreasuryManager', function: 'scottsMotherAddr' },
      { contract: 'TreasuryManager', function: 'sophieJones' },
      { contract: 'TreasuryManager', function: 'mariah' },
      { contract: 'TreasuryManager', function: 'colombiaFund' },
      { contract: 'TreasuryManager', function: 'openSlotA' },
      { contract: 'TreasuryManager', function: 'openSlotB' },
      { contract: 'TreasuryManager', function: 'infrastructureReserve' },
      { contract: 'TreasuryManager', function: 'classEquityRebuildFund' },
      { contract: 'TreasuryManager', function: 'infrastructureReserveBP' },
      { contract: 'TreasuryManager', function: 'infrastructureReserveSet' },
      { contract: 'TreasuryManager', function: 'totalDistributed' },
      { contract: 'TreasuryManager', function: 'distributionCount' },
    ]);

    const state = {};
    results.forEach(r => {
      if (r.success) state[r.function] = r.result;
    });

    return state;
  }

  /**
   * Push current coherence score to the on-chain SolidarityToken.
   * Syncs the off-chain ThreeBodyCoherence state to the contract.
   */
  async pushCoherenceOnChain() {
    if (!this.booted) throw new Error('System not booted. Call boot() first.');

    const state = this.coherence.getState();
    const toUint = (v) => Math.round(v * 10000); // 0.618 -> 6180

    console.log('Pushing coherence on-chain:', state.score.toFixed(4), '(' + state.level + ')');

    const result = await this.contracts.callWrite(
      'SolidarityToken', 'updateCoherence',
      [toUint(state.score), toUint(state.bodies.safety), toUint(state.bodies.harmony), toUint(state.bodies.demand)]
    );

    if (result.success) {
      console.log('Coherence pushed. Gas used:', result.gasUsed);
    }
    return result;
  }

  /**
   * Distribute revenue through TreasuryManager.
   * Coherence-aware: records the transaction and recalculates system state.
   * @param {string} amountEth — Amount in ETH to distribute
   */
  async distribute(amountEth) {
    if (!this.booted) throw new Error('System not booted. Call boot() first.');

    console.log('Distributing', amountEth, 'ETH through TreasuryManager...');
    console.log('Coherence before:', this.coherence.getScore().toFixed(4),
      '(' + this.coherence.getLevel() + ')');

    const result = await this.contracts.callWrite(
      'TreasuryManager', 'distribute', [],
      { value: amountEth }
    );

    if (result.success) {
      // Record in coherence engine — updates demand + recalculates
      const gasUsed = parseInt(result.gasUsed) || 0;
      this.coherence.recordTransaction(
        parseFloat(amountEth),
        parseFloat(amountEth) * 0.001,  // approximate fee
        gasUsed
      );
      console.log('Distribution confirmed. Gas used:', result.gasUsed);
      console.log('Coherence after:', this.coherence.getScore().toFixed(4),
        '(' + this.coherence.getLevel() + ')');
    }

    return result;
  }

  /**
   * Get deployer wallet balance.
   */
  async getBalance() {
    return this.wallet.getBalance('deployer');
  }

  /**
   * Full system status report.
   */
  async statusReport() {
    console.log('\n' + '='.repeat(60));
    console.log('SOLIDARITY FINANCIAL SYSTEM — STATUS REPORT');
    console.log('='.repeat(60));

    this.blockchain.printStatusReport();

    const balance = await this.getBalance();
    console.log('\nDeployer Balance:', balance.balance, 'ETH');

    const state = await this.getTreasuryState();
    console.log('\nTreasury State:');
    console.log('  Owner:', state.owner);
    console.log('  Infra Reserve BP:', state.infrastructureReserveBP);
    console.log('  Total Distributed:', state.totalDistributed);
    console.log('  Distribution Count:', state.distributionCount);

    // Three-Body Coherence
    this.coherence.printReport();

    this.processor.printStatusReport();
    this.contracts.printStatusReport();

    return { balance, state, coherence: this.coherence.getState() };
  }
}

// Singleton export
const solidarity = new SolidarityFinancialSystem();

module.exports = {
  solidarity,
  SolidarityFinancialSystem,
  // Individual modules for direct access
  BlockchainConnector,
  WalletManager,
  TransactionProcessor,
  SmartContractManager,
  FinancialOptimizer,
  FinancialConfiguration,
  CoreMathematicsEngine,
  BridgingSafetyCoordinator,
  ThreeBodyCoherence,
  TREASURY_ABI,
  TREASURY_ADDRESS,
  TOKEN_ABI,
  TOKEN_ADDRESS,
  // Triangle network / market projection
  entityRegistry,
  pythagoreanBalancer,
  computeTriangle,
  buildNetwork,
  toRenderableGraph,
  project,
  runStressTest,
  runMarketProjection,
  // IBM 4-week living-network forecast
  runMarketWeeklyForecast,
  printForecastReport,
};

// Demo — boots the whole system
async function demo() {
  console.log('SOLIDARITY FINANCIAL SYSTEM — Full Boot Demo');
  console.log('='.repeat(60));

  const RPC = process.env.SEPOLIA_RPC_URL;
  const KEY = process.env.PRIVATE_KEY;

  if (!RPC || !KEY) {
    console.log('Set SEPOLIA_RPC_URL and PRIVATE_KEY environment variables.');
    console.log('Example:');
    console.log('  SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY \\');
    console.log('  PRIVATE_KEY=YOUR_KEY \\');
    console.log('  node financial_systems/');
    return;
  }

  await solidarity.boot({ rpcUrl: RPC, privateKey: KEY });
  await solidarity.statusReport();
}

if (require.main === module) {
  demo().catch(console.error);
}
