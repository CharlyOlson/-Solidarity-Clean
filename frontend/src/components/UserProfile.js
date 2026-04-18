/*
 * SOLIDARITY PLATFORM - USER PROFILE
 * ====================================
 * Authenticated-state profile view.
 * Shows email, tier badge, display name, logout.
 */

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import './UserProfile.css';

const TIER_COLORS = {
  Personal: '#B8B5A8',
  Pro: '#D4AF37',
  Business: '#4CAF50',
};

function UserProfile({ onLogout }) {
  const email = localStorage.getItem('userEmail') || localStorage.getItem('userId') || 'user@solidarity.app';
  const storedTier = localStorage.getItem('userTier') || 'Personal';
  const storedName = localStorage.getItem('userDisplayName') || '';

  const [tier, setTier] = useState(storedTier);
  const [displayName, setDisplayName] = useState(storedName);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${API_BASE_URL}/api/stripe/subscription-status`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.tier) {
          const displayTier = data.tier.charAt(0).toUpperCase() + data.tier.slice(1);
          setTier(displayTier);
          localStorage.setItem('userTier', displayTier);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = () => {
    localStorage.setItem('userDisplayName', displayName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userTier');
    localStorage.removeItem('userDisplayName');
    onLogout();
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-avatar">
          {(displayName || email).charAt(0).toUpperCase()}
        </div>

        <h2 className="profile-heading">Your Profile</h2>

        <div className="profile-field">
          <span className="profile-label">Email</span>
          <span className="profile-value">{email}</span>
        </div>

        <div className="profile-field">
          <span className="profile-label">Tier</span>
          <span
            className="profile-tier-badge"
            style={{ background: TIER_COLORS[tier] || '#B8B5A8' }}
          >
            {tier}
          </span>
        </div>

        <div className="profile-field">
          <span className="profile-label">Display Name</span>
          <div className="profile-name-row">
            <input
              type="text"
              className="profile-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Set display name"
            />
            <button className="profile-save-btn" onClick={handleSave}>
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <button className="profile-logout-btn" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default UserProfile;
