#!/usr/bin/env node
/*
 * SOLIDARITY PLATFORM - LICENSE KEY GENERATOR
 * ============================================
 *
 * Run this script to generate license keys for approved users.
 * Only the platform owner should have access to this script.
 *
 * Usage:
 *   node scripts/generate-license-key.js <tier> <userId> [daysValid]
 *
 * Examples:
 *   node scripts/generate-license-key.js student alice 365
 *   node scripts/generate-license-key.js practitioner bob 180
 *   node scripts/generate-license-key.js operator enterprise 730
 *
 * Tiers:
 *   observer     - Documentation only (free)
 *   student      - Test mode API access (free, limited)
 *   practitioner - Full API in test mode (certification required)
 *   operator     - Full production access (commercial license)
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const { generateLicenseKey, TIERS } = require('../src/api/middleware/license');

const [,, tier, userId, daysStr] = process.argv;

if (!tier || !userId) {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║           SOLIDARITY PLATFORM — LICENSE KEY GENERATOR        ║
║                                                              ║
║  Owner: Scott Charles Olson                                  ║
║  Trademark: TRADEMARKED BY SCOTT CHARLES OLSON               ║
╚══════════════════════════════════════════════════════════════╝

Usage:
  node scripts/generate-license-key.js <tier> <userId> [daysValid]

Available Tiers:
`);

    for (const [name, info] of Object.entries(TIERS)) {
        console.log(`  ${name.padEnd(15)} Level ${info.level} — ${info.description}`);
        console.log(`  ${''.padEnd(15)} Rate limit: ${info.rateLimit}/min | Financial: ${info.financial} | Live mode: ${!info.testModeOnly}`);
        console.log(`  ${''.padEnd(15)} Features: ${info.features.join(', ')}`);
        console.log();
    }

    console.log(`Examples:
  node scripts/generate-license-key.js student alice 365
  node scripts/generate-license-key.js practitioner bob 180
  node scripts/generate-license-key.js operator enterprise 730
`);
    process.exit(1);
}

const days = parseInt(daysStr || '365', 10);

try {
    const result = generateLicenseKey(tier, userId, days);

    console.log(`
╔══════════════════════════════════════════════════════════════╗
║              LICENSE KEY GENERATED SUCCESSFULLY               ║
╚══════════════════════════════════════════════════════════════╝

  Key:        ${result.key}
  Tier:       ${result.tier} (Level ${result.tierInfo.level} — ${result.tierInfo.name})
  User:       ${result.userId}
  Expires:    ${result.expiresAt}
  Valid for:  ${result.daysValid} days

  Features:   ${result.tierInfo.features.join(', ')}
  Rate Limit: ${result.tierInfo.rateLimit} requests/minute
  Financial:  ${result.tierInfo.financial ? 'Yes' : 'No'}
  Live Mode:  ${result.tierInfo.testModeOnly ? 'No (test mode only)' : 'Yes'}
  AI Access:  ${result.tierInfo.aiAccess ? 'Yes' : 'No'}
  Max Stamps: ${result.tierInfo.maxStamps === -1 ? 'Unlimited' : result.tierInfo.maxStamps}

─────────────────────────────────────────────────────────

  HOW TO USE:

  1. Set environment variable:
     export SOLIDARITY_LICENSE_KEY="${result.key}"

  2. Or pass as header:
     curl -H "X-License-Key: ${result.key}" http://localhost:3000/api/health

  3. Or pass as query parameter:
     http://localhost:3000/api/health?license_key=${result.key}

─────────────────────────────────────────────────────────
  KEEP THIS KEY SECURE. DO NOT SHARE PUBLICLY.
─────────────────────────────────────────────────────────
`);
} catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
}
