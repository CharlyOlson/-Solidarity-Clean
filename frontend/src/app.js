/*
 * SOLIDARITY PLATFORM - MAIN APP WITH TWO-STATE UX
 * ==================================================
 * Browse State (unauthenticated): Login, News, Markets, About, Credits
 * Auth State (authenticated): Profile, News, Markets, About, Subscribe,
 *   AI Chat, Wallets, Hanko Stamps, Devices, Calculator, Credits
 *
 * TRADEMARK: Scott Charles Olson
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import './App.css';

/* Browse-state components */
import LoginRegister from './components/LoginRegister';
import News from './components/News';
import Markets from './components/Markets';
import About from './components/About';

/* Auth-state components */
import UserProfile from './components/UserProfile';
import OllamaHome from './components/OllamaHome';
import WalletHub from './components/WalletHub';
import HankoStamps from './components/HankoStamps';
import TrustedDevices from './components/TrustedDevices';
import PaymentCalculator from './components/PaymentCalculator';
import LockGate from './components/LockGate';
import Subscribe from './components/Subscribe';
import Credits from './components/Credits';

import { API_BASE_URL } from './config/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState(() =>
    localStorage.getItem('token') ? 'profile' : 'login'
  );
  const [showOptions, setShowOptions] = useState(false);
  const [settings, setSettings] = useState({ theme: 'light', notifications: true, safety_level: 0.5 });
  const optionsRef = useRef(null);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    setActiveTab('profile');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDisplayName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userTier');
    setIsAuthenticated(false);
    setActiveTab('login');
    setShowOptions(false);
  }, []);

  // Fetch settings on auth
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setSettings(prev => ({ ...prev, ...data })); })
      .catch(() => {});
  }, [isAuthenticated]);

  // Close options dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    if (showOptions) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptions]);

  // Save a setting
  const updateSetting = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updated)
      }).catch(() => {});
    }
  };

  /* Tab definitions */
  const browseTabs = [
    { id: 'login', label: 'Login' },
    { id: 'news', label: 'News' },
    { id: 'markets', label: 'Markets' },
    { id: 'about', label: 'About' },
    { id: 'credits', label: 'Credits' },
  ];

  const authTabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'news', label: 'News' },
    { id: 'markets', label: 'Markets' },
    { id: 'about', label: 'About' },
    { id: 'subscribe', label: 'Subscribe' },
    { id: 'ai', label: 'AI Chat' },
    { id: 'wallets', label: 'Wallets' },
    { id: 'hanko', label: 'Hanko Stamps' },
    { id: 'devices', label: 'Devices' },
    { id: 'calculator', label: 'Calculator' },
    { id: 'credits', label: 'Credits' },
  ];

  const tabs = isAuthenticated ? authTabs : browseTabs;

  /* Render active tab */
  const renderTab = () => {
    switch (activeTab) {
      case 'login':
        return <LoginRegister onLoginSuccess={handleLoginSuccess} />;
      case 'profile':
        return <UserProfile onLogout={handleLogout} />;
      case 'news':
        return <News />;
      case 'markets':
        return <Markets />;
      case 'about':
        return <About />;
      case 'subscribe':
        return <Subscribe />;
      case 'ai':
        return <OllamaHome />;
      case 'wallets':
        return <WalletHub />;
      case 'hanko':
        return <HankoStamps />;
      case 'devices':
        return <TrustedDevices />;
      case 'calculator':
        return <PaymentCalculator />;
      case 'credits':
        return <Credits />;
      default:
        return isAuthenticated ? <UserProfile onLogout={handleLogout} /> : <LoginRegister onLoginSuccess={handleLoginSuccess} />;
    }
  };

  const displayName = localStorage.getItem('userDisplayName') || localStorage.getItem('userEmail') || '';
  const userTier = localStorage.getItem('userTier') || 'Personal';

  // Gear icon SVG
  const GearIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );

  return (
    <div className="app">
      {/* Main Navigation */}
      <nav className="main-nav">
        <div className="nav-brand">
          <h1>SOLIDARITY PLATFORM</h1>
          <p className="trademark">&copy; Scott Charles Olson</p>
        </div>
        <div className="nav-row">
          <div className="nav-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'tab active' : 'tab'}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isAuthenticated && displayName && (
              <span className="nav-user">
                {displayName}
                <span className="tier-badge">{userTier}</span>
              </span>
            )}
            <div ref={optionsRef} style={{ position: 'relative' }}>
              <button
                className="options-gear-btn"
                onClick={() => setShowOptions(!showOptions)}
                title="Settings"
              >
                <GearIcon />
              </button>
              {showOptions && (
                <div className="options-dropdown">
                  <h4>Settings</h4>
                  <div className="option-row">
                    <span className="option-label">Theme</span>
                    <button
                      className={`option-toggle ${settings.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => updateSetting('theme', settings.theme === 'dark' ? 'light' : 'dark')}
                    >
                      {settings.theme === 'dark' ? 'Dark' : 'Light'}
                    </button>
                  </div>
                  <div className="option-row">
                    <span className="option-label">Notifications</span>
                    <button
                      className={`option-toggle ${settings.notifications ? 'active' : ''}`}
                      onClick={() => updateSetting('notifications', !settings.notifications)}
                    >
                      {settings.notifications ? 'On' : 'Off'}
                    </button>
                  </div>
                  <div className="option-row">
                    <span className="option-label">Safety Level</span>
                    <div className="option-slider-container">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={settings.safety_level}
                        onChange={(e) => updateSetting('safety_level', parseFloat(e.target.value))}
                        className="option-slider"
                      />
                    </div>
                  </div>
                  <button
                    className="option-link-btn"
                    onClick={() => { setActiveTab('about'); setShowOptions(false); }}
                  >
                    About
                  </button>
                  {isAuthenticated && (
                    <button
                      className="option-link-btn logout"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Content */}
      <main className="tab-content">
        {renderTab()}
      </main>

      {/* LockGate Security Overlay (always visible) */}
      <LockGate />
    </div>
  );
}

export default App;
