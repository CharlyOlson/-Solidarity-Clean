/*
 * SOLIDARITY PLATFORM - LOGIN / REGISTER
 * =======================================
 * Browse-state authentication component.
 * POST to /api/auth/login and /api/auth/register, stores JWT in localStorage.
 */

import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api';
import './LoginRegister.css';

function LoginRegister({ onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        setError(data.error || data.message || 'Authentication failed.');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('userId', data.user.id || data.user.username);
        localStorage.setItem('userEmail', data.user.username || data.user.email || email);
        localStorage.setItem('userTier', data.user.tier || 'Personal');
        localStorage.setItem('userDisplayName', data.user.displayName || '');
      }

      onLoginSuccess();
    } catch (err) {
      if (!navigator.onLine) {
        setError('You appear to be offline. Check your internet connection.');
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Unable to reach the server. It may be restarting — try again in a moment.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-register-container">
      <div className="login-register-card">
        <div className="lr-header">
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="lr-subtitle">
            {mode === 'login'
              ? 'Sign in to access your Solidarity account'
              : 'Join the Solidarity Platform'}
          </p>
        </div>

        <div className="lr-toggle">
          <button
            className={mode === 'login' ? 'lr-toggle-btn active' : 'lr-toggle-btn'}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Log In
          </button>
          <button
            className={mode === 'register' ? 'lr-toggle-btn active' : 'lr-toggle-btn'}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && <div className="lr-error">{error}</div>}

        <form onSubmit={handleSubmit} className="lr-form">
          <label className="lr-label">
            Email
            <input
              type="email"
              className="lr-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </label>

          <label className="lr-label">
            Password
            <input
              type="password"
              className="lr-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter password"
            />
          </label>

          {mode === 'register' && (
            <label className="lr-label">
              Confirm Password
              <input
                type="password"
                className="lr-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm password"
              />
            </label>
          )}

          <button type="submit" className="lr-submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginRegister;
