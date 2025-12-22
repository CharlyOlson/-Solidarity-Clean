/*
 * SOLIDARITY PLATFORM - WALLET MANAGER
 * ===================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

import React, { useMemo, useState } from 'react';
import './WalletManager.css';

const BASE_RATIO = 1.618;
const BRIDGING_BASELINE = 0.618;

const initialWallets = [
  { id: 'wlt-1', name: 'Primary', symbol: 'SOL', chain: 'Solidarity', balance: 2618.42, safetyLevel: BRIDGING_BASELINE },
  { id: 'wlt-2', name: 'Ops', symbol: 'USDC', chain: 'Sepolia (test)', balance: 1480.0, safetyLevel: 0.75 },
  { id: 'wlt-3', name: 'Research', symbol: 'ETH', chain: 'Sepolia (test)', balance: 8.14, safetyLevel: 0.42 }
];

const activitySeed = [
  { id: 'act-1', type: 'receive', amount: 420.5, symbol: 'SOL', counterparty: 'Node-7 Treasury', status: 'confirmed', timestamp: 'Just now' },
  { id: 'act-2', type: 'send', amount: 75.0, symbol: 'USDC', counterparty: 'Validator Pool', status: 'pending', timestamp: '5m ago' },
  { id: 'act-3', type: 'receive', amount: 0.5, symbol: 'ETH', counterparty: 'Research Grant', status: 'confirmed', timestamp: '1h ago' }
];

function calculatePhiSplit(total, buckets) {
  const weights = buckets.map((_, i) => Math.pow(BRIDGING_BASELINE, i));
  const sum = weights.reduce((acc, w) => acc + w, 0);
  return buckets.map((_, i) => (weights[i] / sum) * total);
}

function WalletManager() {
  const [wallets, setWallets] = useState(initialWallets);
  const [activities, setActivities] = useState(activitySeed);
  const [selectedWallet, setSelectedWallet] = useState(initialWallets[0].id);
  const [form, setForm] = useState({ mode: 'send', amount: '', address: '', note: '' });

  const totals = useMemo(() => {
    const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
    const phiTargets = calculatePhiSplit(totalBalance, wallets);
    return { totalBalance, phiTargets };
  }, [wallets]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return;

    const now = new Date().toISOString();
    const walletIndex = wallets.findIndex((w) => w.id === selectedWallet);
    if (walletIndex === -1) return;

    const updatedWallets = [...wallets];
    if (form.mode === 'send') {
      updatedWallets[walletIndex].balance = Math.max(0, updatedWallets[walletIndex].balance - amount);
    } else {
      updatedWallets[walletIndex].balance += amount;
    }

    setWallets(updatedWallets);
    setActivities([
      {
        id: `act-${activities.length + 1}`,
        type: form.mode,
        amount,
        symbol: updatedWallets[walletIndex].symbol,
        counterparty: form.address || 'Unknown',
        status: 'pending',
        timestamp: now
      },
      ...activities
    ]);

    setForm({ ...form, amount: '', address: '', note: '' });
  };

  return (
    <div className="wallet-manager">
      <header className="wm-header">
        <div>
          <p className="wm-kicker">Solidarity Wallet Control · φ baseline {BRIDGING_BASELINE.toFixed(3)}</p>
          <h2>Wallet Manager</h2>
          <p className="wm-sub">Send, receive, and monitor holdings with sacred-node-aware safety.</p>
        </div>
        <div className="wm-total">
          <span>Total Holdings</span>
          <strong>{totals.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          <small>Multi-chain · Safety harmonized</small>
        </div>
      </header>

      <section className="wm-grid">
        <div className="wm-card">
          <div className="wm-card-head">
            <h3>Wallets</h3>
            <span className="wm-pill">φ split</span>
          </div>
          <div className="wm-wallet-list">
            {wallets.map((wallet, idx) => {
              const target = totals.phiTargets[idx] || 0;
              const delta = wallet.balance - target;
              return (
                <button
                  key={wallet.id}
                  className={`wm-wallet ${selectedWallet === wallet.id ? 'active' : ''}`}
                  onClick={() => setSelectedWallet(wallet.id)}
                >
                  <div>
                    <div className="wm-wallet-name">{wallet.name} · {wallet.symbol}</div>
                    <div className="wm-wallet-meta">{wallet.chain} · safety {wallet.safetyLevel.toFixed(3)}</div>
                  </div>
                  <div className="wm-wallet-balance">
                    <strong>{wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                    <small className={delta >= 0 ? 'wm-positive' : 'wm-negative'}>
                      {delta >= 0 ? '+' : ''}{delta.toFixed(2)} vs φ target
                    </small>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="wm-card">
          <div className="wm-card-head">
            <h3>Send / Receive</h3>
            <span className="wm-pill secondary">Baseline {BRIDGING_BASELINE}</span>
          </div>
          <form className="wm-form" onSubmit={handleSubmit}>
            <div className="wm-toggle">
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="send"
                  checked={form.mode === 'send'}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                />
                Send
              </label>
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="receive"
                  checked={form.mode === 'receive'}
                  onChange={(e) => setForm({ ...form, mode: e.target.value })}
                />
                Receive
              </label>
            </div>
            <div className="wm-field">
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                required
                min="0"
              />
            </div>
            <div className="wm-field">
              <label>{form.mode === 'send' ? 'To Address' : 'From Address'}</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="0x, solid:did, or descriptor"
              />
            </div>
            <div className="wm-field">
              <label>Note</label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Optional memo"
              />
            </div>
            <button type="submit" className="wm-submit">
              {form.mode === 'send' ? 'Send Securely' : 'Acknowledge Receipt'}
            </button>
          </form>
        </div>

        <div className="wm-card">
          <div className="wm-card-head">
            <h3>Activity</h3>
            <span className="wm-pill tertiary">Live</span>
          </div>
          <div className="wm-activity">
            {activities.map((act) => (
              <div key={act.id} className={`wm-activity-row ${act.type}`}>
                <div>
                  <div className="wm-activity-title">{act.type === 'send' ? 'Sent' : 'Received'} {act.amount} {act.symbol}</div>
                  <div className="wm-activity-meta">{act.counterparty} · {act.timestamp}</div>
                </div>
                <span className={`wm-status ${act.status}`}>{act.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default WalletManager;
