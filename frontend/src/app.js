/*
 * SOLIDARITY PLATFORM - MAIN APP WITH TAB NAVIGATION
 * ===================================================
 *
 * TRADEMARK: Scott Charles Olson - March 31, 1997
 */

import React, { useState, useEffect } from 'react';
import './App.css';
import OllamaHome from './components/OllamaHome';
import UserLogs from './components/UserLogs';
import HankoStamps from './components/HankoStamps';
import WalletManager from './components/WalletManager';
import Discover from './components/Discover';
import TrustedDevices from './components/TrustedDevices';
import ConnectedBanks from './components/ConnectedBanks';
import PaymentCalculator from './components/PaymentCalculator';
import LockGate from './components/LockGate';
import { ensureDemoToken } from './utils/auth';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Ensure demo token exists on app load
  useEffect(() => {
    ensureDemoToken();
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'home':
        return <OllamaHome />;
      case 'logs':
        return <UserLogs />;
      case 'hanko':
        return <HankoStamps />;
      case 'wallet':
        return <WalletManager />;
      case 'discover':
        return <Discover />;
      case 'devices':
        return <TrustedDevices />;
      case 'banks':
        return <ConnectedBanks />;
      case 'calculator':
        return <PaymentCalculator />;
      default:
        return <OllamaHome />;
    }
  };

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'logs', label: 'User Logs' },
    { id: 'hanko', label: 'Hanko Stamps' },
    { id: 'wallet', label: 'Wallet' },
    { id: 'discover', label: 'Discover' },
    { id: 'devices', label: 'Devices' },
    { id: 'banks', label: 'Banks' },
    { id: 'calculator', label: 'Calculator' },
  ];

  return (
    <div className="app">
      {/* Main Navigation */}
      <nav className="main-nav">
        <div className="nav-brand">
          <h1>SOLIDARITY PLATFORM</h1>
          <p className="trademark">&copy; Scott Charles Olson &mdash; &phi; = 1.618</p>
        </div>
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
