/*
 * SOLIDARITY PLATFORM - CENTRAL API ROUTER
 * =========================================
 *
 * Unified API gateway for all integrations (AI, blockchain, market data, etc.)
 * Uses only free/public endpoints and local modules.
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * Repository: https://github.com/CharlyOlson/-Solidarity-Clean
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const router = express.Router();
const { UnifiedSystemConfiguration } = require('../../config/system_config');
const logger = require('../../logger');
const axios = require('axios');

// Load config
const config = new UnifiedSystemConfiguration().getConfig();

// === AI (Ollama) Proxy ===
router.post('/ai/ollama', async (req, res) => {
  try {
    const { prompt, options } = req.body;
    const result = await axios.post('http://localhost:11434/api/generate', { prompt, ...options });
    logger.info('Ollama AI request', { prompt });
    res.json(result.data);
  } catch (err) {
    logger.error('Ollama AI error', { error: err.message });
    res.status(500).json({ error: 'Ollama AI error', details: err.message });
  }
});

// === Blockchain (Ethereum Sepolia) Proxy ===
router.post('/blockchain/eth', async (req, res) => {
  try {
    const { method, params } = req.body;
    const rpcUrl = config.financial?.blockchain_networks?.ethereum?.sepolia?.rpc_url || 'https://rpc.sepolia.org';
    const result = await axios.post(rpcUrl, { jsonrpc: '2.0', id: 1, method, params });
    logger.info('Ethereum RPC request', { method });
    res.json(result.data);
  } catch (err) {
    logger.error('Ethereum RPC error', { error: err.message });
    res.status(500).json({ error: 'Ethereum RPC error', details: err.message });
  }
});

// === Market Data (CoinGecko) Proxy ===
router.get('/marketdata/coingecko/:endpoint', async (req, res) => {
  try {
    const endpoint = req.params.endpoint;
    const url = `https://api.coingecko.com/api/v3/${endpoint}`;
    const result = await axios.get(url, { params: req.query });
    logger.info('CoinGecko request', { endpoint });
    res.json(result.data);
  } catch (err) {
    logger.error('CoinGecko error', { error: err.message });
    res.status(500).json({ error: 'CoinGecko error', details: err.message });
  }
});


// === Shared Operational Status Endpoint ===
const { getSharedOperationalStatus } = require('../../config/system_config');

router.get('/operational-status', (req, res) => {
  try {
    const percent = getSharedOperationalStatus();
    res.json({
      success: true,
      operationalPercent: percent,
      message: `Unified operational status: ${percent}%`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    logger.error('Operational status error', { error: err.message });
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
