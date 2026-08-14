/*
 * SOLIDARITY PLATFORM - WALLET MANAGER
 * =====================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 * 
 * =====================================
 * 
 * Multi-wallet portfolio management — LIVE
 * Uses ethers.js v6 for real balance queries and wallet operations.
 * Base ratio (phi = 1.618) for portfolio optimization.
 */

const { ethers } = require('ethers');

class WalletManager {
  constructor(config = {}) {
    this.version = '2.0.0';
    this.baseRatio = 1.618;
    this.bridgingBaseline = 0.618;

    this.config = {
      testMode: config.testMode !== undefined ? config.testMode : true,
      rpcUrl: config.rpcUrl || null,
      defaultNetwork: config.defaultNetwork || 'ethereum'
    };

    this.provider = null;
    this.wallets = new Map();  // name -> { name, address, privateKey, signer, network, tokens }
    this.connected = false;

    console.log('Wallet Manager v2.0.0 initialized (ethers.js v6)');
    console.log('Test Mode:', this.config.testMode ? 'ENABLED' : 'DISABLED');
  }

  /**
   * Connect to an RPC provider for balance queries and transactions.
   */
  async connectProvider(rpcUrl) {
    const url = rpcUrl || this.config.rpcUrl;
    if (!url) throw new Error('No RPC URL provided');

    this.provider = new ethers.JsonRpcProvider(url);
    const network = await this.provider.getNetwork();
    this.connected = true;
    console.log('Provider connected, chain ID:', Number(network.chainId));
    return { success: true, chainId: Number(network.chainId) };
  }

  /**
   * Create a new random wallet.
   */
  createWallet(name, network = 'ethereum') {
    if (this.wallets.has(name)) {
      return { success: false, error: 'Wallet name already exists' };
    }

    const randomWallet = ethers.Wallet.createRandom();
    const signer = this.provider ? randomWallet.connect(this.provider) : null;

    const entry = {
      name,
      address: randomWallet.address,
      privateKey: randomWallet.privateKey,
      mnemonic: randomWallet.mnemonic ? randomWallet.mnemonic.phrase : null,
      signer,
      network,
      tokens: new Map(),
      createdAt: Date.now()
    };

    this.wallets.set(name, entry);
    console.log('Created wallet:', name, '->', randomWallet.address);

    return {
      success: true,
      name,
      address: randomWallet.address,
      mnemonic: entry.mnemonic
    };
  }

  /**
   * Import an existing wallet by private key.
   */
  importWallet(name, privateKey, network = 'ethereum') {
    if (this.wallets.has(name)) {
      return { success: false, error: 'Wallet name already exists' };
    }

    try {
      const wallet = new ethers.Wallet(privateKey);
      const signer = this.provider ? wallet.connect(this.provider) : null;

      const entry = {
        name,
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: null,
        signer,
        network,
        tokens: new Map(),
        createdAt: Date.now()
      };

      this.wallets.set(name, entry);
      console.log('Imported wallet:', name, '->', wallet.address);

      return { success: true, name, address: wallet.address };
    } catch (err) {
      return { success: false, error: 'Invalid private key: ' + err.message };
    }
  }

  /**
   * Get real ETH balance for a named wallet.
   */
  async getBalance(walletName) {
    const w = this.wallets.get(walletName);
    if (!w) return { success: false, error: 'Wallet not found' };
    if (!this.provider) return { success: false, error: 'No provider connected' };

    const balanceWei = await this.provider.getBalance(w.address);
    const balanceEth = parseFloat(ethers.formatEther(balanceWei));

    return {
      success: true,
      name: walletName,
      address: w.address,
      balance: balanceEth,
      balanceWei: balanceWei.toString(),
      unit: 'ETH',
      timestamp: Date.now()
    };
  }

  /**
   * Track a token for a wallet (stores contract address for future ERC-20 queries).
   */
  addToken(walletName, tokenSymbol, tokenAddress, decimals = 18) {
    const w = this.wallets.get(walletName);
    if (!w) return { success: false, error: 'Wallet not found' };

    w.tokens.set(tokenSymbol, { address: tokenAddress, decimals, balance: null });
    return { success: true, wallet: walletName, token: tokenSymbol };
  }

  /**
   * Query real ERC-20 token balance on-chain.
   */
  async getTokenBalance(walletName, tokenSymbol) {
    const w = this.wallets.get(walletName);
    if (!w) return { success: false, error: 'Wallet not found' };
    if (!this.provider) return { success: false, error: 'No provider connected' };

    const token = w.tokens.get(tokenSymbol);
    if (!token) return { success: false, error: 'Token not tracked for this wallet' };

    const erc20 = new ethers.Contract(token.address, [
      'function balanceOf(address) view returns (uint256)',
      'function decimals() view returns (uint8)'
    ], this.provider);

    try {
      const bal = await erc20.balanceOf(w.address);
      const decimals = await erc20.decimals();
      const formatted = parseFloat(ethers.formatUnits(bal, decimals));
      token.balance = formatted;

      return {
        success: true,
        wallet: walletName,
        token: tokenSymbol,
        balance: formatted,
        rawBalance: bal.toString()
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Calculate total portfolio value across all wallets (ETH only for now).
   */
  async calculatePortfolioValue() {
    if (!this.provider) return { success: false, error: 'No provider connected' };

    let totalEth = 0;
    const breakdown = [];

    for (const [name, w] of this.wallets) {
      const balanceWei = await this.provider.getBalance(w.address);
      const eth = parseFloat(ethers.formatEther(balanceWei));
      totalEth += eth;
      breakdown.push({ name, address: w.address, balance: eth });
    }

    return {
      success: true,
      totalEth,
      walletCount: this.wallets.size,
      breakdown,
      timestamp: Date.now()
    };
  }

  /**
   * Optimize portfolio allocation using phi distribution.
   * Primary asset gets 61.8%, rest split by descending phi powers.
   */
  optimizePortfolio(breakdown) {
    if (!breakdown || breakdown.length === 0) {
      return { success: false, error: 'No wallets to optimize' };
    }

    // Sort by balance descending
    const sorted = [...breakdown].sort((a, b) => b.balance - a.balance);
    const total = sorted.reduce((sum, w) => sum + w.balance, 0);

    if (total === 0) {
      return { success: true, recommendations: [], message: 'All wallets empty' };
    }

    const recommendations = [];
    let remaining = 1.0;

    sorted.forEach((w, i) => {
      const currentAllocation = w.balance / total;
      let targetAllocation;

      if (i === 0) {
        targetAllocation = this.bridgingBaseline; // 61.8%
      } else {
        targetAllocation = remaining * this.bridgingBaseline;
      }
      remaining -= targetAllocation;

      const diff = targetAllocation - currentAllocation;
      if (Math.abs(diff) > 0.05) { // >5% drift
        recommendations.push({
          wallet: w.name,
          currentPct: (currentAllocation * 100).toFixed(2) + '%',
          targetPct: (targetAllocation * 100).toFixed(2) + '%',
          action: diff > 0 ? 'increase' : 'decrease',
          driftPct: (Math.abs(diff) * 100).toFixed(2) + '%'
        });
      }
    });

    return { success: true, recommendations };
  }

  /**
   * Get a signer for a named wallet (for sending transactions).
   */
  getSigner(walletName) {
    const w = this.wallets.get(walletName);
    if (!w) return null;
    if (!w.signer && this.provider && w.privateKey) {
      w.signer = new ethers.Wallet(w.privateKey, this.provider);
    }
    return w.signer;
  }

  /**
   * List all wallets.
   */
  listWallets() {
    const list = [];
    for (const [name, w] of this.wallets) {
      list.push({
        name,
        address: w.address,
        network: w.network,
        tokens: Array.from(w.tokens.keys()),
        createdAt: w.createdAt
      });
    }
    return list;
  }

  /**
   * Get wallet details by name.
   */
  getWallet(name) {
    const w = this.wallets.get(name);
    if (!w) return null;
    return {
      name: w.name,
      address: w.address,
      network: w.network,
      tokens: Array.from(w.tokens.entries()).map(([sym, t]) => ({ symbol: sym, ...t }))
    };
  }

  printStatusReport() {
    console.log('\nWALLET MANAGER v2.0.0 STATUS');
    console.log('='.repeat(60));
    console.log('Connected:', this.connected);
    console.log('Wallets:', this.wallets.size);
    console.log('Test Mode:', this.config.testMode);

    for (const [name, w] of this.wallets) {
      console.log(`  ${name}: ${w.address} (${w.network})`);
    }
    console.log('='.repeat(60));
  }
}

module.exports = { WalletManager };

// Demo
async function demo() {
  console.log('Wallet Manager v2.0.0 — Live Demo');
  console.log('='.repeat(60));

  const RPC = process.env.SEPOLIA_RPC_URL;
  if (!RPC) {
    console.log('Set SEPOLIA_RPC_URL to run the live demo.');
    return;
  }

  const wm = new WalletManager({ testMode: true });
  await wm.connectProvider(RPC);

  // Import the deployer wallet
  wm.importWallet('deployer', 'e2dc4116421212b5b005a4f2ca5e2e5b518f2b2f698274d21d12e55aff6bd28d');

  // Check balance
  const bal = await wm.getBalance('deployer');
  console.log('Deployer balance:', bal.balance, 'ETH');

  // Portfolio
  const portfolio = await wm.calculatePortfolioValue();
  console.log('Portfolio total:', portfolio.totalEth, 'ETH across', portfolio.walletCount, 'wallets');

  wm.printStatusReport();
}

if (require.main === module) {
  demo().catch(console.error);
}
