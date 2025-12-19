/*
 * SOLIDARITY PLATFORM - TEST SETUP
 * =================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

// Jest global test setup
// Keep timeout reasonable for integration tests
jest.setTimeout(15000);

// Optional: silence noisy console during tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => originalError(...args);
  console.warn = (...args) => originalWarn(...args);
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
