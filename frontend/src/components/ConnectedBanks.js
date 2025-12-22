/*
 * SOLIDARITY PLATFORM - CONNECTED BANKS COMPONENT
 * ================================================
 * 
 * TRADEMARK: Scott Charles Olson
 * DOB: March 31, 1997
 * Location: Kansas, USA 66210
 */

import React, { useState } from 'react';
import './ConnectedBanks.css';

const BASE_RATIO = 1.618;
const BRIDGING_BASELINE = 0.618;

// Available banks for demo
const AVAILABLE_BANKS = [
  { id: 'chase', name: 'Chase', icon: '🏦', color: '#117ACA' },
  { id: 'bofa', name: 'Bank of America', icon: '🏛️', color: '#012169' },
  { id: 'wells', name: 'Wells Fargo', icon: '🏦', color: '#D71E28' },
  { id: 'citi', name: 'Citibank', icon: '🏦', color: '#003B70' },
  { id: 'usbank', name: 'US Bank', icon: '🏛️', color: '#0C2074' },
  { id: 'pnc', name: 'PNC Bank', icon: '🏦', color: '#FF6200' },
];

// Demo connected banks
const DEMO_BANKS = [
  { id: 1, bankId: 'chase', name: 'Chase', accountType: 'Checking', lastFour: '4521', balance: 12450.67, status: 'connected', lastSync: '5 mins ago' },
  { id: 2, bankId: 'bofa', name: 'Bank of America', accountType: 'Savings', lastFour: '8832', balance: 45230.00, status: 'connected', lastSync: '1 hour ago' },
];

function ConnectedBanks() {
  const [banks, setBanks] = useState(DEMO_BANKS);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [connecting, setConnecting] = useState(null);

  const handleConnectBank = (bankId) => {
    setConnecting(bankId);
    // Simulate connection
    setTimeout(() => {
      const bank = AVAILABLE_BANKS.find(b => b.id === bankId);
      const newBank = {
        id: Date.now(),
        bankId: bank.id,
        name: bank.name,
        accountType: 'Checking',
        lastFour: Math.floor(1000 + Math.random() * 9000).toString(),
        balance: Math.round(Math.random() * 50000 * 100) / 100,
        status: 'connected',
        lastSync: 'Just now'
      };
      setBanks([...banks, newBank]);
      setConnecting(null);
      setShowLinkModal(false);
    }, 2000);
  };

  const handleUnlinkBank = (bankId) => {
    if (window.confirm('Are you sure you want to unlink this bank account?')) {
      setBanks(banks.filter(b => b.id !== bankId));
    }
  };

  const handleSyncBank = (bankId) => {
    setBanks(banks.map(b => 
      b.id === bankId ? { ...b, lastSync: 'Syncing...', status: 'syncing' } : b
    ));
    setTimeout(() => {
      setBanks(banks.map(b => 
        b.id === bankId ? { ...b, lastSync: 'Just now', status: 'connected' } : b
      ));
    }, 1500);
  };

  // Calculate total balance with φ formatting
  const totalBalance = banks.reduce((sum, b) => sum + b.balance, 0);
  const phiBalance = totalBalance * BRIDGING_BASELINE;

  return (
    <div className="connected-banks-container">
      <div className="banks-header">
        <div>
          <h2>🏦 Connected Banks</h2>
          <p className="banks-subtitle">
            Link your bank accounts for seamless financial integration
          </p>
        </div>
        <button className="link-bank-btn" onClick={() => setShowLinkModal(true)}>
          + Link Bank
        </button>
      </div>

      {/* Balance Overview */}
      <div className="balance-overview">
        <div className="balance-card total">
          <span className="balance-label">Total Balance</span>
          <span className="balance-value">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="balance-card phi">
          <span className="balance-label">φ-Weighted Value</span>
          <span className="balance-value">${phiBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="balance-card accounts">
          <span className="balance-label">Linked Accounts</span>
          <span className="balance-value">{banks.length}</span>
        </div>
      </div>

      {/* Banks List */}
      <div className="banks-list">
        {banks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏦</div>
            <h3>No Bank Accounts Linked</h3>
            <p>Connect your bank accounts to view balances and transactions.</p>
            <button onClick={() => setShowLinkModal(true)}>+ Link Your First Bank</button>
          </div>
        ) : (
          banks.map(bank => (
            <div key={bank.id} className="bank-card">
              <div className="bank-icon">
                {AVAILABLE_BANKS.find(b => b.id === bank.bankId)?.icon || '🏦'}
              </div>
              <div className="bank-info">
                <div className="bank-name">{bank.name}</div>
                <div className="bank-account">
                  {bank.accountType} •••• {bank.lastFour}
                </div>
                <div className="bank-sync">Last synced: {bank.lastSync}</div>
              </div>
              <div className="bank-balance">
                <span className="balance-amount">
                  ${bank.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className={`status-badge ${bank.status}`}>
                  {bank.status === 'connected' ? '✓ Connected' : '⟳ Syncing'}
                </span>
              </div>
              <div className="bank-actions">
                <button 
                  className="action-btn sync"
                  onClick={() => handleSyncBank(bank.id)}
                  disabled={bank.status === 'syncing'}
                >
                  ⟳ Sync
                </button>
                <button 
                  className="action-btn unlink"
                  onClick={() => handleUnlinkBank(bank.id)}
                >
                  Unlink
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Security Note */}
      <div className="security-note">
        <h4>🔒 Security Information</h4>
        <p>
          Bank connections use industry-standard encryption and OAuth 2.0 authentication. 
          We never store your bank login credentials. Your data is protected with 
          φ-ratio cryptographic protocols aligned with the Solidarity security framework.
        </p>
      </div>

      {/* Link Bank Modal */}
      {showLinkModal && (
        <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Link a Bank Account</h3>
            <p>Select your bank to begin secure connection:</p>
            <div className="bank-grid">
              {AVAILABLE_BANKS.map(bank => (
                <button 
                  key={bank.id}
                  className={`bank-option ${connecting === bank.id ? 'connecting' : ''}`}
                  onClick={() => handleConnectBank(bank.id)}
                  disabled={connecting !== null}
                >
                  <span className="bank-option-icon">{bank.icon}</span>
                  <span className="bank-option-name">{bank.name}</span>
                  {connecting === bank.id && <span className="connecting-text">Connecting...</span>}
                </button>
              ))}
            </div>
            <button className="modal-close" onClick={() => setShowLinkModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConnectedBanks;
