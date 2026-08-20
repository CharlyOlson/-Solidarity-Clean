/*
 * SOLIDARITY PLATFORM - STRIPE ROUTES
 * ====================================
 *
 * POST /api/stripe/create-checkout-session — Stripe Checkout for Pro tier
 * GET  /api/stripe/subscription-status     — Current user's subscription tier
 *
 * TRADEMARK: Scott Charles Olson
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { stmts, db } = require('../db');
const logger = require('../../utils/logger');

/* ── Demo / override account ── */
const DEMO_ACCOUNT_ID = '55cc5056-8dd6-4631-9eb9-c4967acabc04';
const DEMO_ACCOUNT_EMAIL = 'demo@solidarity.local';

/* ── Stripe Price IDs ── */
const PRICE_MAP = {
  pro: {
    month: 'price_1TNMrcHKDThuncCuRne8HXY1',  // Pro $29/mo
    year: 'price_1TNMrcHKDThuncCuYxLlMMJ3',    // Pro $290/yr
  },
  business: {
    year: 'price_1TMGOaHKDThuncCuHKq5Z8Ao',    // Business annual-only
  },
};

/* ── Lazy Stripe init ── */
let stripe = null;
function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

/* ── Ensure user_tiers table exists ── */
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_tiers (
      user_id TEXT PRIMARY KEY,
      tier TEXT NOT NULL DEFAULT 'personal',
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
} catch (err) {
  logger.error('user_tiers table init failed', { error: err.message });
}

const getTier = db.prepare('SELECT tier FROM user_tiers WHERE user_id = ?');
const upsertTier = db.prepare(`
  INSERT INTO user_tiers (user_id, tier, updated_at)
  VALUES (?, ?, datetime('now'))
  ON CONFLICT(user_id) DO UPDATE SET tier = excluded.tier, updated_at = datetime('now')
`);

/* Seed demo account as business tier */
try {
  upsertTier.run(DEMO_ACCOUNT_ID, 'business');
} catch (_) { /* ignore if user doesn't exist yet */ }

// ─────────────────────────────────────────────────────────
// GET /api/stripe/subscription-status
// ─────────────────────────────────────────────────────────
router.get('/subscription-status', requireAuth, (req, res) => {
  const userId = req.user.id;
  const username = req.user.username;

  /* Demo account always returns business */
  if (userId === DEMO_ACCOUNT_ID || username === DEMO_ACCOUNT_EMAIL) {
    return res.json({ tier: 'business', active: true });
  }

  const row = getTier.get(userId);
  const tier = row ? row.tier : 'personal';
  res.json({ tier, active: true });
});

// ─────────────────────────────────────────────────────────
// POST /api/stripe/create-checkout-session
// ─────────────────────────────────────────────────────────
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  const s = getStripe();
  if (!s) {
    return res.status(400).json({ error: 'Stripe not configured. Set STRIPE_SECRET_KEY.' });
  }

  const { tier, interval } = req.body;

  /* Validate tier */
  if (!tier || !PRICE_MAP[tier]) {
    return res.status(400).json({ error: 'Invalid tier. Use "pro" or "business".' });
  }

  /* Business is annual-only */
  if (tier === 'business' && interval !== 'year') {
    return res.status(400).json({ error: 'Business tier is annual-only.' });
  }

  /* Validate interval */
  const billingInterval = interval === 'year' ? 'year' : 'month';
  const priceId = PRICE_MAP[tier][billingInterval];

  if (!priceId) {
    return res.status(400).json({ error: 'Invalid billing interval.' });
  }

  try {
    const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const session = await s.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/?success=true`,
      cancel_url: `${appUrl}/?canceled=true`,
      customer_email: req.user.username,
      metadata: {
        userId: req.user.id,
        tier,
        interval: billingInterval,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    logger.warn('Stripe checkout session failed', { error: err.message });
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

module.exports = router;
