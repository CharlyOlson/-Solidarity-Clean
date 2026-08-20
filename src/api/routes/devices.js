/*
 * SOLIDARITY PLATFORM - DEVICE EXCHANGE API ROUTES
 * =================================================
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
const { PHI } = require('../../utils/constants');

// Device state (in production, use database)
let devices = [
  {
    id: 'device-a',
    name: 'Device A',
    status: 'active',
    value: PHI,
    safetyLevel: 0.618,
    node: 7,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'device-b',
    name: 'Device B',
    status: 'active',
    value: 1 / PHI,
    safetyLevel: 0.618,
    node: 14,
    lastUpdate: new Date().toISOString()
  }
];

/**
 * GET /devices
 * List all devices
 */
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      devices,
      count: devices.length,
      phi: PHI,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Device list error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /devices/:id
 * Get single device by ID
 */
router.get('/:id', (req, res) => {
  try {
    const device = devices.find(d => d.id === req.params.id);
    
    if (!device) {
      return res.status(404).json({ 
        success: false, 
        error: 'Device not found' 
      });
    }
    
    res.json({
      success: true,
      device,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Device get error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /devices/swap
 * Execute device A/B swap with φ-ratio weighted exchange
 */
router.post('/swap', (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    
    // Find devices A and B
    const deviceA = devices.find(d => d.id === 'device-a');
    const deviceB = devices.find(d => d.id === 'device-b');
    
    if (!deviceA || !deviceB) {
      return res.status(404).json({ 
        success: false, 
        error: 'Devices not found' 
      });
    }
    
    console.log(`🔄 Executing device swap...`);
    console.log(`   Before: A=${deviceA.value.toFixed(6)}, B=${deviceB.value.toFixed(6)}`);
    
    // Swap values with φ-ratio conservation
    const tempValue = deviceA.value;
    const tempNode = deviceA.node;
    
    deviceA.value = deviceB.value;
    deviceA.node = deviceB.node;
    deviceA.lastUpdate = timestamp;
    
    deviceB.value = tempValue;
    deviceB.node = tempNode;
    deviceB.lastUpdate = timestamp;
    
    // Verify conservation (A + B should remain constant)
    const totalValue = deviceA.value + deviceB.value;
    const expectedTotal = PHI + (1 / PHI);
    const conserved = Math.abs(totalValue - expectedTotal) < 0.0001;
    
    console.log(`   After:  A=${deviceA.value.toFixed(6)}, B=${deviceB.value.toFixed(6)}`);
    console.log(`   Conservation: ${conserved ? '✅' : '⚠️'} (${totalValue.toFixed(6)})`);
    
    res.json({
      success: true,
      operation: 'swap',
      devices: [deviceA, deviceB],
      conservation: {
        maintained: conserved,
        total: totalValue,
        expected: expectedTotal,
        difference: Math.abs(totalValue - expectedTotal)
      },
      phi: PHI,
      timestamp
    });
  } catch (error) {
    console.error('Swap error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * PUT /devices/:id
 * Update device properties
 */
router.put('/:id', (req, res) => {
  try {
    const device = devices.find(d => d.id === req.params.id);
    
    if (!device) {
      return res.status(404).json({ 
        success: false, 
        error: 'Device not found' 
      });
    }
    
    const { status, value, safetyLevel, node } = req.body;
    
    if (status !== undefined) device.status = status;
    if (value !== undefined) device.value = parseFloat(value);
    if (safetyLevel !== undefined) device.safetyLevel = parseFloat(safetyLevel);
    if (node !== undefined) device.node = parseInt(node);
    
    device.lastUpdate = new Date().toISOString();
    
    console.log(`📝 Updated device ${device.id}:`, device);
    
    res.json({
      success: true,
      device,
      timestamp: device.lastUpdate
    });
  } catch (error) {
    console.error('Device update error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /devices/balance
 * Calculate force balance across devices
 */
router.post('/balance', (req, res) => {
  try {
    // Calculate angel/daemon forces based on sacred nodes
    const angelForce = devices
      .filter(d => [7, 14, 21].includes(d.node))
      .reduce((sum, d) => sum + d.value, 0);
    
    const daemonForce = devices
      .filter(d => [1, 3, 4, 49].includes(d.node))
      .reduce((sum, d) => sum + d.value, 0);
    
    const totalForce = angelForce + daemonForce;
    const balance = Math.abs(angelForce - daemonForce);
    const balanced = balance < 0.1;
    
    res.json({
      success: true,
      angelForce,
      daemonForce,
      totalForce,
      balance,
      balanced,
      threshold: 0.1,
      phi: PHI,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /devices/reset
 * Reset devices to default φ-ratio values
 */
router.post('/reset', (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    
    devices[0].value = PHI;
    devices[0].node = 7;
    devices[0].status = 'active';
    devices[0].lastUpdate = timestamp;
    
    devices[1].value = 1 / PHI;
    devices[1].node = 14;
    devices[1].status = 'active';
    devices[1].lastUpdate = timestamp;
    
    console.log('🔄 Devices reset to default φ-ratio values');
    
    res.json({
      success: true,
      devices,
      phi: PHI,
      timestamp
    });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
