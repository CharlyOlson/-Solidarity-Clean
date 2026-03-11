/*
 * SOLIDARITY PLATFORM - MAIN APP WITH TAB NAVIGATION
 * ===================================================
 *
 * TRADEMARK: Scott Charles Olson - March 31, 1997
 */

import React, { useState, useEffect } from 'react';
import './App.css';
import OllamaHome from './components/OllamaHome';
import QuipNotes from './components/QuipNotes';
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
      case 'quipnotes':
        return <QuipNotes />;
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

  return (
    <div className="app">
      {/* Main Navigation */}
      <nav className="main-nav">
        <div className="nav-brand">
          <h1>SOLIDARITY PLATFORM</h1>
          <p className="trademark">© Scott Charles Olson - φ = 1.618</p>
        </div>
        <div className="nav-tabs">
          <button
            className={activeTab === 'home' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('home')}
          >
            🏠 HOME
          </button>
          <button
            className={activeTab === 'quipnotes' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('quipnotes')}
          >
            🌐 QuipNotes
          </button>
          <button
            className={activeTab === 'logs' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('logs')}
          >
            📊 User Logs
          </button>
          <button
            className={activeTab === 'hanko' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('hanko')}
          >
            🎴 Hanko Stamps
          </button>
          <button
            className={activeTab === 'wallet' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('wallet')}
          >
            💰 Wallet
          </button>
          <button
            className={activeTab === 'discover' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('discover')}
          >
            📊 Discover
          </button>
          <button
            className={activeTab === 'devices' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('devices')}
          >
            📱 Devices
          </button>
          <button
            className={activeTab === 'banks' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('banks')}
          >
            🏦 Banks
          </button>
          <button
            className={activeTab === 'calculator' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('calculator')}
          >
            🧮 Calculator
          </button>
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
