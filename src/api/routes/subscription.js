/*
 * SOLIDARITY PLATFORM - SUBSCRIPTION ROUTES
 * ==========================================
 *
 * Stripe integration for business tier subscriptions.
 * Personal tier is free. Business tier requires active subscription.
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');

// Stripe is loaded lazily — only when API key is configured
let stripe = null;

function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

// ─────────────────────────────────────────────────────────
// GET /api/subscription/status — Check subscription status
// ─────────────────────────────────────────────────────────
router.get('/status', async (req, res) => {
  const tier = process.env.TIER || 'personal';

  // Personal tier is always active — no subscription needed
  if (tier === 'personal') {
    return res.json({
      success: true,
      tier: 'personal',
      status: 'active',
      message: 'Personal tier is free.',
    });
  }

  // Business tier — check Stripe
  const s = getStripe();
  if (!s) {
    return res.json({
      success: true,
      tier: 'business',
      status: 'unconfigured',
      message: 'Stripe not configured. Set STRIPE_SECRET_KEY to enable subscriptions.',
    });
  }

  const customerId = req.headers['x-customer-id'] || req.query.customerId;
  if (!customerId) {
    return res.json({
      success: true,
      tier: 'business',
      status: 'no_customer',
      message: 'No customer ID provided.',
    });
  }

  try {
    const subscriptions = await s.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    const active = subscriptions.data.length > 0;
    const sub = active ? subscriptions.data[0] : null;

    res.json({
      success: true,
      tier: 'business',
      status: active ? 'active' : 'inactive',
      subscription: active ? {
        id: sub.id,
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        plan: sub.items.data[0]?.price?.id || 'unknown',
      } : null,
    });
  } catch (err) {
    logger.warn('Stripe subscription check failed', { error: err.message });
    res.status(500).json({ success: false, error: 'Subscription check failed' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/subscription/checkout — Create checkout session
// ─────────────────────────────────────────────────────────
router.post('/checkout', async (req, res) => {
  const s = getStripe();
  if (!s) {
    return res.status(400).json({
      success: false,
      error: 'Stripe not configured.',
    });
  }

  const { priceId, customerId, successUrl, cancelUrl } = req.body;

  if (!priceId) {
    return res.status(400).json({ success: false, error: 'priceId is required' });
  }

  try {
    const sessionOpts = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${req.protocol}://${req.get('host')}/?subscribed=true`,
      cancel_url: cancelUrl || `${req.protocol}://${req.get('host')}/?cancelled=true`,
    };

    if (customerId) {
      sessionOpts.customer = customerId;
    }

    const session = await s.checkout.sessions.create(sessionOpts);

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    logger.warn('Stripe checkout creation failed', { error: err.message });
    res.status(500).json({ success: false, error: 'Checkout creation failed' });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/subscription/webhook — Stripe webhook handler
// ─────────────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const s = getStripe();
  if (!s) {
    return res.status(400).json({ error: 'Stripe not configured' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    logger.warn('Stripe webhook secret not configured');
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  let event;
  try {
    event = s.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.warn('Stripe webhook signature verification failed', { error: err.message });
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  // Handle subscription events
  switch (event.type) {
    case 'customer.subscription.created':
      logger.info('Subscription created', { customerId: event.data.object.customer });
      break;
    case 'customer.subscription.updated':
      logger.info('Subscription updated', { customerId: event.data.object.customer });
      break;
    case 'customer.subscription.deleted':
      logger.info('Subscription cancelled', { customerId: event.data.object.customer });
      break;
    case 'invoice.payment_succeeded':
      logger.info('Payment succeeded', { customerId: event.data.object.customer });
      break;
    case 'invoice.payment_failed':
      logger.warn('Payment failed', { customerId: event.data.object.customer });
      break;
    default:
      logger.info('Unhandled webhook event', { type: event.type });
  }

  res.json({ received: true });
});

// ─────────────────────────────────────────────────────────
// POST /api/subscription/portal — Customer portal session
// ─────────────────────────────────────────────────────────
router.post('/portal', async (req, res) => {
  const s = getStripe();
  if (!s) {
    return res.status(400).json({ success: false, error: 'Stripe not configured' });
  }

  const { customerId, returnUrl } = req.body;
  if (!customerId) {
    return res.status(400).json({ success: false, error: 'customerId is required' });
  }

  try {
    const session = await s.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${req.protocol}://${req.get('host')}/`,
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    logger.warn('Stripe portal session failed', { error: err.message });
    res.status(500).json({ success: false, error: 'Portal session failed' });
  }
});

module.exports = router;
