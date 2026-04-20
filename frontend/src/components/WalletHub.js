/*
 * SOLIDARITY PLATFORM - WALLET HUB
 * ==================================
 * Three wallet sub-sections: Crypto, Banks, Cards/Payment.
 * Each starts dim and lights up (gold border + green dot) when connected.
 */

import React, { useState } from 'react';
import ConnectedBanks from './ConnectedBanks';
import './WalletHub.css';

function CryptoWallet() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [ethBalance, setEthBalance] = useState('0.00');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setError('');
    if (!window.ethereum) {
      setError('MetaMask not detected. Please install MetaMask to connect.');
      return;
    }
    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        const addr = accounts[0];
        setAddress(addr);
        setConnected(true);
        // Fetch real ETH balance
        try {
          const balHex = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [addr, 'latest']
          });
          const balWei = parseInt(balHex, 16);
          const balEth = (balWei / 1e18).toFixed(6);
          setEthBalance(balEth);
        } catch (balErr) {
          console.error('Balance fetch error:', balErr);
        }
      }
    } catch (err) {
      console.error('MetaMask connection error:', err);
      setError('Connection rejected or failed. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <div className={connected ? 'wallet-section wallet-active' : 'wallet-section wallet-dim'}>
      <div className="wallet-section-header">
        <span className={connected ? 'wallet-dot connected' : 'wallet-dot'}></span>
        <h3>Crypto Wallet</h3>
        <span className="wallet-status-text">{connected ? 'Connected' : 'Not Connected'}</span>
      </div>
      {connected ? (
        <div className="wallet-section-body">
          <div className="wallet-detail"><span>Address</span><span>{shortAddr}</span></div>
          <div className="wallet-detail"><span>SLDRT</span><span>0.00</span></div>
          <div className="wallet-detail"><span>ETH</span><span>{ethBalance}</span></div>
        </div>
      ) : (
        <div className="wallet-section-body">
          <p className="wallet-placeholder">Connect your crypto wallet to view balances.</p>
          {error && <p className="wallet-error" style={{ color: '#e74c3c', fontSize: '0.85rem', margin: '0.5rem 0' }}>{error}</p>}
          <button className="wallet-connect-btn" onClick={handleConnect} disabled={connecting}>
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      )}
    </div>
  );
}

function CardsPayment() {
  const [connected, setConnected] = useState(false);

  const handleAdd = () => {
    setConnected(true);
  };

  return (
    <div className={connected ? 'wallet-section wallet-active' : 'wallet-section wallet-dim'}>
      <div className="wallet-section-header">
        <span className={connected ? 'wallet-dot connected' : 'wallet-dot'}></span>
        <h3>Cards / Payment</h3>
        <span className="wallet-status-text">{connected ? 'Connected' : 'Not Connected'}</span>
      </div>
      {connected ? (
        <div className="wallet-section-body">
          <div className="wallet-detail"><span>Card</span><span>**** **** **** 4242</span></div>
          <div className="wallet-detail"><span>Expiry</span><span>12/28</span></div>
          <div className="wallet-detail"><span>Type</span><span>Visa</span></div>
        </div>
      ) : (
        <div className="wallet-section-body">
          <p className="wallet-placeholder">Add a payment method for subscriptions.</p>
          <button className="wallet-connect-btn" onClick={handleAdd}>Add Card</button>
        </div>
      )}
    </div>
  );
}

function BanksWrapper() {
  const [expanded, setExpanded] = useState(false);
  const connected = false;

  return (
    <div className={connected ? 'wallet-section wallet-active' : 'wallet-section wallet-dim'}>
      <div className="wallet-section-header">
        <span className={connected ? 'wallet-dot connected' : 'wallet-dot'}></span>
        <h3>Connected Banks</h3>
        <span className="wallet-status-text">{connected ? 'Connected' : 'Not Connected'}</span>
      </div>
      <div className="wallet-section-body">
        {expanded ? (
          <ConnectedBanks />
        ) : (
          <>
            <p className="wallet-placeholder">Link your bank accounts for transfers.</p>
            <button className="wallet-connect-btn" onClick={() => setExpanded(true)}>
              Manage Banks
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function WalletHub() {
  return (
    <div className="wallet-hub-container">
      <h2 className="wallet-hub-title">Wallets</h2>
      <p className="wallet-hub-subtitle">Connect and manage your financial accounts</p>
      <div className="wallet-hub-grid">
        <CryptoWallet />
        <BanksWrapper />
        <CardsPayment />
      </div>
    </div>
  );
}

export default WalletHub;
