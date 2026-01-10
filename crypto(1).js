/**
 * SOLIDARITY PLATFORM - CRYPTO UTILITIES
 * Client-side SHA-256 hashing using Web Crypto API
 */

/**
 * Compute SHA-256 hash of a string (async)
 * @param {string} str - Input string to hash
 * @returns {Promise<string>} - Hex-encoded hash
 */
export async function sha256Hex(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generate random hex string (client-side)
 * @param {number} bytes - Number of random bytes
 * @returns {string} - Hex-encoded random string
 */
export function randomHex(bytes = 16) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute HMAC-SHA256 (for client verification preview)
 * Note: Backend must perform authoritative HMAC verification
 * @param {string} key - Hex-encoded key
 * @param {string} message - Message to sign
 * @returns {Promise<string>} - Hex-encoded HMAC
 */
export async function hmacSHA256Hex(key, message) {
  // Convert hex key to binary
  const keyBytes = new Uint8Array(key.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes);
  const signatureArray = Array.from(new Uint8Array(signature));
  return signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
