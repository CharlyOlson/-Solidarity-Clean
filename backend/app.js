// SOLIDARITY PLATFORM - MAIN BACKEND SERVER
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Controllers
app.use('/api/lockgate', require('../LockGate'));
app.use('/api/financial', require('./financialDataController'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Solidarity backend running on port ${PORT}`);
});

module.exports = app;
