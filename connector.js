/**
 * SOLIDARITY PLATFORM - API CONNECTOR
 * Unified backend communication with secure fetch patterns
 */

// Adjust base path if backend is on different origin
const BASE = '';

/**
 * Fetch all devices
 * @returns {Promise<Object>} - { devices: [...] }
 */
export async function fetchDevices() {
  const resp = await fetch(`${BASE}/devices`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    credentials: 'omit'
  });
  
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
  }
  
  return resp.json();
}

/**
 * Execute device A/B swap
 * @returns {Promise<Object>} - { devices: [...], timestamp, ... }
 */
export async function swapAB() {
  const resp = await fetch(`${BASE}/devices/swap`, {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    credentials: 'omit'
  });
  
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
  }
  
  return resp.json();
}

/**
 * Request nonce for HMAC verification
 * @param {string} userId - User identifier
 * @returns {Promise<Object>} - { nonce, timestamp }
 */
export async function requestNonce(userId) {
  const resp = await fetch(`${BASE}/api/lockgate/nonce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
  }
  
  return resp.json();
}

/**
 * Submit Lock Gate payload
 * @param {Object} payload - Lock gate payload
 * @param {string} clientHash - Client-computed hash
 * @returns {Promise<Object>} - Backend response
 */
export async function submitLockGate(payload, clientHash) {
  const resp = await fetch(`${BASE}/api/lockgate/prepare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload, clientHash })
  });
  
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
  }
  
  return resp.json();
}
