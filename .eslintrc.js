/*
 * SOLIDARITY PLATFORM - ESLINT CONFIGURATION
 * ===========================================
 *
 * Declares the project's target environment so linters and Codacy understand
 * that ES2020+ syntax (optional chaining, destructuring, const/let, shorthand
 * properties, template literals, trailing commas) is intentional and supported.
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

'use strict';

module.exports = {
  env: {
    node: true,
    es2020: true,
    commonjs: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'commonjs',
  },
  rules: {
    // Allow require() at module level and inside functions (CommonJS pattern)
    'global-require': 'off',
    // Shorthand properties are preferred (object-shorthand)
    'object-shorthand': ['warn', 'always'],
    // Template literals are preferred over concatenation
    'prefer-template': 'warn',
    // No unused variables (catches typos without blocking valid patterns)
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
