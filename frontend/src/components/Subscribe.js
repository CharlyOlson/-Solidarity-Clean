/*
 * SOLIDARITY PLATFORM - SUBSCRIBE COMPONENT
 * ==========================================
 *
 * Three-tier pricing: Personal (free), Pro ($29/mo or $290/yr), Business (annual, TBD)
 *
 * TRADEMARK: Scott Charles Olson — March 31, 1997
 */

import React, { useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../config/api';
import './Subscribe.css';

function Subscribe() {
  const [interval, setInterval_] = useState('month');
  const [currentTier, setCurrentTier] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  /* Check URL params for success/cancel redirect */
  const params = new URLSearchParams(window.location.search);
  const showSuccess = params.get('success') === 'true';
  const showCanceled = params.get('canceled') === 'true';

  /* Fetch current subscription tier */
  const fetchTier = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('/api/stripe/subscription-status'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentTier(data.tier || 'personal');
      }
    } catch (_) {
      /* default to personal on error */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTier();
  }, [fetchTier]);

  /* Handle upgrade click */
  const handleUpgrade = async (tier) => {
    setError('');
    setCheckoutLoading(true);
    try {
      const token = localStorage.getItem('token');
      const body = { tier, interval };
      const res = await fetch(apiUrl('/api/stripe/create-checkout-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
      }
    } catch (err) {
      setError('Network error — please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return <div className="subscribe-loading">Loading subscription info...</div>;
  }

  return (
    <div className="subscribe-container">
      <div className="subscribe-header">
        <h2>Choose Your Plan</h2>
        <p>Unlock the full power of the Solidarity Platform</p>
      </div>

      {showSuccess && (
        <div className="subscribe-banner success">
          Subscription activated! Welcome to your new plan.
        </div>
      )}
      {showCanceled && (
        <div className="subscribe-banner canceled">
          Checkout canceled — no charges were made.
        </div>
      )}

      {error && <div className="subscribe-error">{error}</div>}

      {/* Billing toggle */}
      <div className="billing-toggle">
        <button
          className={interval === 'month' ? 'active' : ''}
          onClick={() => setInterval_('month')}
        >
          Monthly
        </button>
        <button
          className={interval === 'year' ? 'active' : ''}
          onClick={() => setInterval_('year')}
        >
          Yearly (save 17%)
        </button>
      </div>

      {/* Pricing cards */}
      <div className="subscribe-cards">
        {/* ── Personal ── */}
        <div className={`subscribe-card${currentTier === 'personal' ? ' current' : ''}`}>
          {currentTier === 'personal' && <span className="current-badge">Current Plan</span>}
          <div className="tier-icon">{'\u03C6'}</div>
          <h3>Personal</h3>
          <div className="card-price">
            <span className="free-label">Free</span>
          </div>
          <ul className="feature-list">
            <li>Local AI (Ollama)</li>
            <li>Basic wallet</li>
            <li>Community access</li>
            <li>Geometric analysis tools</li>
          </ul>
          {currentTier === 'personal' ? (
            <button className="subscribe-btn current-btn">Your Current Plan</button>
          ) : (
            <button className="subscribe-btn current-btn">Included</button>
          )}
        </div>

        {/* ── Pro ── */}
        <div className={`subscribe-card${currentTier === 'pro' ? ' current' : ''}`}>
          {currentTier === 'pro' && <span className="current-badge">Current Plan</span>}
          <div className="tier-icon">{'\u2B50'}</div>
          <h3>Pro</h3>
          <div className="card-price">
            {interval === 'month' ? (
              <>
                <span className="amount">$29</span>
                <span className="period">/month</span>
              </>
            ) : (
              <>
                <span className="amount">$290</span>
                <span className="period">/year</span>
              </>
            )}
          </div>
          <ul className="feature-list">
            <li>Cloud AI (Perplexity)</li>
            <li>Advanced analytics</li>
            <li>Priority support</li>
            <li>All Personal features</li>
          </ul>
          {currentTier === 'pro' ? (
            <button className="subscribe-btn current-btn">Your Current Plan</button>
          ) : (
            <button
              className="subscribe-btn gold"
              disabled={checkoutLoading}
              onClick={() => handleUpgrade('pro')}
            >
              {checkoutLoading ? 'Redirecting...' : 'Upgrade to Pro'}
            </button>
          )}
        </div>

        {/* ── Business ── */}
        <div className={`subscribe-card${currentTier === 'business' ? ' current' : ''}`}>
          {currentTier === 'business' && <span className="current-badge">Current Plan</span>}
          <div className="tier-icon">{'\u2666'}</div>
          <h3>Business</h3>
          <div className="card-price">
            <span className="tbd-label">Annual &middot; Custom Pricing</span>
          </div>
          <ul className="feature-list">
            <li>Everything in Pro</li>
            <li>Treasury management</li>
            <li>Multi-user accounts</li>
            <li>Hanko verification</li>
            <li>Full API access</li>
          </ul>
          {currentTier === 'business' ? (
            <button className="subscribe-btn current-btn">Your Current Plan</button>
          ) : (
            <button className="subscribe-btn contact-btn">Contact for Pricing</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Subscribe;
