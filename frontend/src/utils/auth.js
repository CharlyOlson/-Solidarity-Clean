/*
 * SOLIDARITY PLATFORM - AUTHENTICATION HELPER
 * =========================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

/**
 * Get or create a demo authentication token for testing
 * In production, this would be replaced with proper OAuth/JWT
 */
export function ensureDemoToken() {
  let token = localStorage.getItem('token');
  
  if (!token) {
    // Create a demo token
    token = `demo-token-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('token', token);
    localStorage.setItem('userId', `demo-user-${Math.random().toString(36).substring(7)}`);
  }
  
  return token;
}

/**
 * Get the current user ID
 */
export function getUserId() {
  return localStorage.getItem('userId') || 'demo-user';
}

/**
 * Clear authentication (logout)
 */
export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
}
