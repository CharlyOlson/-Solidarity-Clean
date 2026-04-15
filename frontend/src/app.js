/*
 * SOLIDARITY PLATFORM - MAIN APP WITH TWO-STATE UX
 * ==================================================
 * Browse State (unauthenticated): Login, News, Markets, About
 * Auth State (authenticated): Profile, News, Markets, About, AI Chat,
 *   Wallets, Hanko Stamps, Devices, Calculator
 *
 * TRADEMARK: Scott Charles Olson — March 31, 1997
 */

import React, { useState, useCallback } from 'react';
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState(() =>
    localStorage.getItem('token') ? 'profile' : 'login'
  );

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    setActiveTab('profile');
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setActiveTab('login');
  }, []);

  /* ── Tab definitions ── */
  const browseTabs = [
    { id: 'login', label: 'Login' },
    { id: 'news', label: 'News' },
    { id: 'markets', label: 'Markets' },
    { id: 'about', label: 'About' },
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
  ];

  const tabs = isAuthenticated ? authTabs : browseTabs;

  /* ── Render active tab ── */
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
      default:
        return isAuthenticated ? <UserProfile onLogout={handleLogout} /> : <LoginRegister onLoginSuccess={handleLoginSuccess} />;
    }
  };

  const displayName = localStorage.getItem('userDisplayName') || localStorage.getItem('userEmail') || '';
  const userTier = localStorage.getItem('userTier') || 'Personal';

  return (
    <div className="app">
      {/* Main Navigation */}
      <nav className="main-nav">
        <div className="nav-brand">
          <h1>SOLIDARITY PLATFORM</h1>
          <p className="trademark">&copy; Scott Charles Olson &mdash; &phi; = 1.618</p>
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
          {isAuthenticated && displayName && (
            <span className="nav-user">
              {displayName}
              <span className="tier-badge">{userTier}</span>
            </span>
          )}
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
