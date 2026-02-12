/**
 * SOLIDARITY PLATFORM - USER DASHBOARD
 * Real-time statistics and activity overview
 */



import React, { useState, useEffect, useCallback } from 'react';
import OperationalStatus from './OperationalStatus';
const API_BASE = '';

export function Dashboard() {
  const [systemStatus, setSystemStatus] = useState('Online');
  const [safetyLevel, setSafetyLevel] = useState('0.618');
  const [wallets, setWallets] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [stats, setStats] = useState({ lockGate: 0, swaps: 0, notes: 0 });
  const [balance, setBalance] = useState(0);
  const [username, setUsername] = useState('');


  const loadDashboard = useCallback(() => {
    const user = JSON.parse(localStorage.getItem('solidarityUser') || '{}');
    if (user.username) setUsername(user.username);
    const statsData = JSON.parse(localStorage.getItem('solidarityStats') || '{"lockGate":0,"swaps":0,"notes":0}');
    setStats(statsData);
    setWallets(user.wallets || []);
    const activities = JSON.parse(localStorage.getItem('solidarityActivity') || '[]');
    setActivityLog(activities.slice(0, 10));
    setSystemStatus(user.systemStatus || 'Online');
    setSafetyLevel(user.safetyLevel || '0.618');
    fetchSystemBalance();
  }, []);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 10000);
    return () => clearInterval(interval);
  }, [loadDashboard]); // Add loadDashboard as dependency



  async function fetchSystemBalance() {
    try {
      const resp = await fetch(`${API_BASE}/devices/balance`, { method: 'POST' });
      if (resp.ok) {
        const data = await resp.json();
        setBalance(data.balance);
      }
    } catch (e) {
      // fallback to local value
      setBalance(0);
    }
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  function addActivity(description) {
    const activities = JSON.parse(localStorage.getItem('solidarityActivity') || '[]');
    activities.unshift({
      timestamp: new Date().toISOString(),
      description
    });
    localStorage.setItem('solidarityActivity', JSON.stringify(activities.slice(0, 50)));
    loadDashboard();
  }

  // Quick actions
  function handleQuickLockGate() {
    addActivity('Navigated to Lock Gate');
    // Implement navigation logic here
  }
  function handleQuickNote() {
    addActivity('Navigated to Quip Notes');
    // Implement navigation logic here
  }
  function handleQuickSwap() {
    addActivity('Navigated to Device Exchange');
    // Implement navigation logic here
  }
  function handleRefreshDash() {
    loadDashboard();
    addActivity('Dashboard refreshed');
  }

  return (
    <div className="dashboard-container">
      <OperationalStatus />
      <div className="dashboard-header">
        <h1>Solidarity Platform Dashboard</h1>
        <div className="dashboard-status">
          <span>Status: {systemStatus}</span>
          <span>Safety Level: {safetyLevel}</span>
        </div>
        <div className="dashboard-user">User: {username}</div>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Wallets</h2>
          <div className="wallet-list">
            {wallets.map((wallet, idx) => (
              <div key={idx} className="wallet-item">
                <span>{wallet.name}</span>
                <span>Balance: {wallet.balance}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dashboard-section">
          <h2>Activity Log</h2>
          <div className="activity-log">
            {activityLog.map((entry, idx) => (
              <div key={idx} className="activity-entry">
                <span>{formatTime(entry.timestamp)}</span>
                <span>{entry.description}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dashboard-section">
          <h2>Stats</h2>
          <div className="stats-list">
            {Object.entries(stats).map(([key, value], idx) => (
              <div key={idx} className="stat-item">
                <span>{key}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dashboard-section">
          <h2>Balance</h2>
          <div className="balance-value">{balance.toFixed(3)}</div>
        </div>
      </div>
      <div style={{ marginTop: 'var(--space-phi-squared)' }}>
        <h3>🎯 Quick Actions</h3>
        <div className="row" style={{ gap: 'var(--space-phi-minus)', flexWrap: 'wrap' }}>
          <button className="btn" onClick={handleQuickLockGate}>🔒 New Lock Gate</button>
          <button className="btn" onClick={handleQuickNote}>📝 New Note</button>
          <button className="btn secondary" onClick={handleQuickSwap}>🔄 Device Swap</button>
          <button className="btn secondary" onClick={handleRefreshDash}>🔃 Refresh</button>
        </div>
      </div>
    </div>
  );
}
