/*
 * SOLIDARITY PLATFORM - FINANCIAL API ROUTES
 * ==========================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Import financial system modules
let WalletManager, TransactionProcessor, FinancialOptimizer;
try {
  const walletManagerPath = path.join(__dirname, '../../../financial_systems/wallet_manager.js');
  const txProcessorPath = path.join(__dirname, '../../../financial_systems/transaction_processor.js');
  const optimizerPath = path.join(__dirname, '../../../financial_systems/financial_optimizer.js');
  
  if (fs.existsSync(walletManagerPath)) {
    WalletManager = require(walletManagerPath).WalletManager;
  }
  if (fs.existsSync(txProcessorPath)) {
    TransactionProcessor = require(txProcessorPath).TransactionProcessor;
  }
  if (fs.existsSync(optimizerPath)) {
    FinancialOptimizer = require(optimizerPath).FinancialOptimizer;
  }
} catch (e) {
  console.warn('Financial modules not yet integrated:', e.message);
}

// Constants
const PHI = 1.618033988749;
const BRIDGING_BASELINE = 0.618;
const SACRED_NODES = [1, 3, 4, 7, 14, 21, 49];

// In-memory state (replace with database in production)
let walletManager = null;
let transactionProcessor = null;
let financialOptimizer = null;

// Initialize financial systems
function initializeFinancialSystems(safetyLevel = BRIDGING_BASELINE) {
  try {
    if (WalletManager && !walletManager) {
      walletManager = new WalletManager({ safetyLevel, testMode: true });
    }
    if (TransactionProcessor && !transactionProcessor) {
      transactionProcessor = new TransactionProcessor({ safetyLevel });
    }
    if (FinancialOptimizer && !financialOptimizer) {
      financialOptimizer = new FinancialOptimizer({ safetyLevel });
    }
  } catch (e) {
    console.warn('Could not initialize financial systems:', e.message);
  }
}

initializeFinancialSystems();

// GET /api/financial/portfolio — Get complete portfolio summary
router.get('/portfolio', (req, res) => {
  try {
    if (!walletManager) {
      return res.json({
        portfolio: {
          totalValue: 0,
          wallets: [],
          assets: new Map(),
          lastUpdate: new Date().toISOString()
        },
        safetyLevel: BRIDGING_BASELINE,
        phiRatio: PHI
      });
    }

    const safetyConfig = walletManager.getSafetyConfig();
    
    res.json({
      portfolio: {
        totalValue: walletManager.portfolio.totalValue,
        assets: Array.from(walletManager.portfolio.assets.entries()).map(([k, v]) => ({ asset: k, value: v })),
        lastUpdate: walletManager.portfolio.lastUpdate
      },
      wallets: walletManager.listWallets(),
      safetyLevel: walletManager.safetyLevel,
      safetyConfig,
      phiRatio: PHI,
      bridgingBaseline: BRIDGING_BASELINE
    });
  } catch (error) {
    console.error('Portfolio error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/financial/optimize — Optimize portfolio with φ-ratio
router.post('/optimize', async (req, res) => {
  try {
    if (!walletManager) {
      return res.json({
        optimized: true,
        savings: 0,
        phiRatio: PHI,
        method: 'mock'
      });
    }

    const result = await walletManager.optimizePortfolio();
    
    res.json({
      optimized: true,
      ...result,
      phiRatio: PHI,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Optimization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/financial/wallet — Create new wallet
router.post('/wallet', async (req, res) => {
  try {
    const { chain, address, node } = req.body;
    
    if (!chain || !address) {
      return res.status(400).json({ error: 'Chain and address required' });
    }

    if (!walletManager) {
      return res.json({
        wallet: {
          chain,
          address,
          balance: 0,
          node: node || 7,
          status: 'active',
          timestamp: new Date().toISOString()
        },
        method: 'mock'
      });
    }

    const wallet = await walletManager.createWallet({ chain, address, node });
    
    res.json({
      wallet,
      safetyConfig: walletManager.getSafetyConfig(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create wallet error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/financial/wallets — List all wallets
router.get('/wallets', (req, res) => {
  try {
    if (!walletManager) {
      return res.json({ wallets: [], count: 0 });
    }

    const wallets = walletManager.listWallets();
    
    res.json({
      wallets,
      count: wallets.length,
      safetyConfig: walletManager.getSafetyConfig()
    });
  } catch (error) {
    console.error('List wallets error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/financial/transaction — Create transaction
router.post('/transaction', async (req, res) => {
  try {
    const { from, to, amount, chain, type } = req.body;
    
    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'From, to, and amount required' });
    }

    if (!transactionProcessor) {
      return res.json({
        transaction: {
          id: Date.now().toString(),
          from,
          to,
          amount,
          chain: chain || 'ethereum',
          type: type || 'transfer',
          status: 'pending',
          timestamp: new Date().toISOString()
        },
        method: 'mock'
      });
    }

    const transaction = await transactionProcessor.createTransaction({
      from,
      to,
      amount,
      chain,
      type
    });
    
    res.json({
      transaction,
      metrics: transactionProcessor.getMetrics(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/financial/transactions — List transactions
router.get('/transactions', (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    
    if (!transactionProcessor) {
      return res.json({ transactions: [], count: 0 });
    }

    let transactions = transactionProcessor.listTransactions();
    
    if (status) {
      transactions = transactions.filter(tx => tx.status === status);
    }
    
    transactions = transactions.slice(0, parseInt(limit));
    
    res.json({
      transactions,
      count: transactions.length,
      metrics: transactionProcessor.getMetrics()
    });
  } catch (error) {
    console.error('List transactions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/financial/gas-price — Get current gas price
router.get('/gas-price', (req, res) => {
  try {
    if (!financialOptimizer) {
      return res.json({
        gasPrice: 20,
        unit: 'gwei',
        method: 'mock',
        timestamp: new Date().toISOString()
      });
    }

    const gasPrice = financialOptimizer.getCurrentGasPrice();
    
    res.json({
      gasPrice,
      history: financialOptimizer.getGasPriceHistory(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gas price error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/financial/batch — Create batch operation
router.post('/batch', async (req, res) => {
  try {
    const { operations } = req.body;
    
    if (!operations || !Array.isArray(operations)) {
      return res.status(400).json({ error: 'Operations array required' });
    }

    if (!financialOptimizer) {
      return res.json({
        batch: {
          id: Date.now().toString(),
          operations: operations.length,
          status: 'queued',
          estimatedSavings: operations.length * 0.3,
          method: 'mock'
        }
      });
    }

    const batch = await financialOptimizer.createBatch(operations);
    
    res.json({
      batch,
      savings: financialOptimizer.getTotalSavings(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/financial/savings — Get optimization savings
router.get('/savings', (req, res) => {
  try {
    if (!financialOptimizer) {
      return res.json({
        totalSavings: 0,
        gasSavings: 0,
        batchedOperations: 0,
        localComputations: 0
      });
    }

    const savings = financialOptimizer.getTotalSavings();
    
    res.json({
      ...savings,
      phiRatio: PHI,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Savings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/financial/safety — Get safety configuration
router.get('/safety', (req, res) => {
  try {
    const configs = {};
    
    if (walletManager) {
      configs.wallet = walletManager.getSafetyConfig();
    }
    if (transactionProcessor) {
      configs.transaction = transactionProcessor.getSafetyConfig();
    }
    if (financialOptimizer) {
      configs.optimizer = financialOptimizer.getSafetyConfig();
    }
    
    res.json({
      safetyLevel: BRIDGING_BASELINE,
      phiRatio: PHI,
      sacredNodes: SACRED_NODES,
      configs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Safety config error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/financial/safety — Update safety level
router.post('/safety', (req, res) => {
  try {
    const { safetyLevel } = req.body;
    
    if (safetyLevel === undefined || safetyLevel < 0 || safetyLevel > 1) {
      return res.status(400).json({ error: 'Safety level must be between 0 and 1' });
    }

    if (walletManager) walletManager.safetyLevel = safetyLevel;
    if (transactionProcessor) transactionProcessor.safetyLevel = safetyLevel;
    if (financialOptimizer) financialOptimizer.safetyLevel = safetyLevel;
    
    res.json({
      safetyLevel,
      updated: true,
      configs: {
        wallet: walletManager?.getSafetyConfig(),
        transaction: transactionProcessor?.getSafetyConfig(),
        optimizer: financialOptimizer?.getSafetyConfig()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update safety error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/financial/metrics — Get all system metrics
router.get('/metrics', (req, res) => {
  try {
    const metrics = {
      portfolio: walletManager?.getPortfolio() || { totalValue: 0 },
      transactions: transactionProcessor?.getMetrics() || {},
      optimization: financialOptimizer?.getTotalSavings() || {},
      safety: {
        level: BRIDGING_BASELINE,
        phiRatio: PHI,
        sacredNodes: SACRED_NODES
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
