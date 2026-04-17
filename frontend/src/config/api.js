/*
 * SOLIDARITY PLATFORM - API CONFIGURATION
 * ========================================
 * 
 * Centralized API URL configuration
 * Uses environment variable or falls back to default
 */

// API Base URL - empty string = same-origin (works in production on Railway)
// Override with REACT_APP_API_URL for local dev pointing at a remote backend
export const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Helper function to build API URLs
export const apiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

export default API_BASE_URL;
