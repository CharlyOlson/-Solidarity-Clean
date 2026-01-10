/*
 * SOLIDARITY PLATFORM - API CONFIGURATION
 * ========================================
 * 
 * Centralized API URL configuration
 * Uses environment variable or falls back to default
 */

// API Base URL - configurable via environment variable
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Helper function to build API URLs
export const apiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
};

export default API_BASE_URL;
