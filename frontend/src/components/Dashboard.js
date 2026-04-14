/**
 * SOLIDARITY PLATFORM - USER DASHBOARD
 * Real-time statistics and activity overview
 *
 * TRADEMARKED BY SCOTT CHARLES OLSON
 */

import React, { useState, useEffect, useCallback } from 'react';
import OperationalStatus from './OperationalStatus';
import { useChainData } from '../hooks/useChainData';

export function Dashboard() {
  const {
    loading: chainLoading,
    error: chainError,
    treasuryState,
    coherenceScore,
    coherenceLevel,
    systemStatus,
    deployerBalance,
    refresh,
  } = useChainData();

  const [wallets, setWallets] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [stats, setStats] = useState({ lockGate: 0, swaps: 0, notes: 0 });
  const [username, setUsername] = useState('');

  const loadLocal = useCallback(() => {
    const user = JSON.parse(localStorage.getItem('solidarityUser') || '{}');
    if (user.username) setUsername(user.username);
    const statsData = JSON.parse(
      localStorage.getItem('solidarityStats') || '{"lockGate":0,"swaps":0,"notes":0}'
    );
    setStats(statsData);
    setWallets(user.wallets || []);
    const activities = JSON.parse(
      localStorage.getItem('solidarityActivity') || '[]'
    );
    setActivityLog(activities.slice(0, 10));
  }, []);

  useEffect(() => {
    loadLocal();
    const interval = setInterval(loadLocal, 10000);
    return () => clearInterval(interval);
  }, [loadLocal]);

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
    const activities = JSON.parse(
      localStorage.getItem('solidarityActivity') || '[]'
    );
    activities.unshift({
      timestamp: new Date().toISOString(),
      description,
    });
    localStorage.setItem(
      'solidarityActivity',
      JSON.stringify(activities.slice(0, 50))
    );
    loadLocal();
  }

  function handleQuickLockGate() {
    addActivity('Navigated to Lock Gate');
  }
  function handleQuickNote() {
    addActivity('Navigated to Quip Notes');
  }
  function handleQuickSwap() {
    addActivity('Navigated to Device Exchange');
  }
  function handleRefreshDash() {
    loadLocal();
    refresh();
    addActivity('Dashboard refreshed');
  }

  return (
    <div className="dashboard-container">
      <OperationalStatus />
      <div className="dashboard-header">
        <h1>Solidarity Platform Dashboard</h1>
        <div className="dashboard-status">
          <span>Status: {chainLoading ? 'Connecting...' : systemStatus}</span>
          <span>
            Coherence: {coherenceScore} ({coherenceLevel})
          </span>
        </div>
        {chainError && (
          <div style={{ color: '#ff6600', fontSize: '0.85rem' }}>
            {chainError}
          </div>
        )}
        <div className="dashboard-user">User: {username}</div>
      </div>

      <div className="dashboard-content">
        {/* Chain data section */}
        <div className="dashboard-section">
          <h2>Chain State (Sepolia)</h2>
          {chainLoading ? (
            <div>Loading chain data...</div>
          ) : (
            <div className="stats-list">
              <div className="stat-item">
                <span>Deployer Balance</span>
                <span>{Number(deployerBalance).toFixed(4)} ETH</span>
              </div>
              <div className="stat-item">
                <span>Distribution Count</span>
                <span>{treasuryState.distributionCount}</span>
              </div>
              <div className="stat-item">
                <span>Total Distributed</span>
                <span>{Number(treasuryState.totalDistributed).toFixed(4)} ETH</span>
              </div>
              <div className="stat-item">
                <span>Infrastructure Reserve</span>
                <span>{treasuryState.infrastructureReserveBP} bp</span>
              </div>
              <div className="stat-item">
                <span>Reserve Set</span>
                <span>{treasuryState.infrastructureReserveSet ? 'Yes' : 'No'}</span>
              </div>
              <div className="stat-item">
                <span>Coherence Score</span>
                <span>{coherenceScore}</span>
              </div>
              <div className="stat-item">
                <span>Coherence Level</span>
                <span>{coherenceLevel}</span>
              </div>
            </div>
          )}
        </div>

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
      </div>

      <div style={{ marginTop: 'var(--space-phi-squared)' }}>
        <h3>Quick Actions</h3>
        <div
          className="row"
          style={{ gap: 'var(--space-phi-minus)', flexWrap: 'wrap' }}
        >
          <button className="btn" onClick={handleQuickLockGate}>
            New Lock Gate
          </button>
          <button className="btn" onClick={handleQuickNote}>
            New Note
          </button>
          <button className="btn secondary" onClick={handleQuickSwap}>
            Device Swap
          </button>
          <button className="btn secondary" onClick={handleRefreshDash}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
