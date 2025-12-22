/*
 * SOLIDARITY PLATFORM - TRUSTED DEVICES COMPONENT
 * ================================================
 * 
 * TRADEMARK: Scott Charles Olson
 * DOB: March 31, 1997
 * Location: Kansas, USA 66210
 */

import React, { useState, useEffect } from 'react';
import './TrustedDevices.css';

const BASE_RATIO = 1.618;
const BRIDGING_BASELINE = 0.618;

// Demo devices for display
const DEMO_DEVICES = [
  { id: 1, name: 'Windows Desktop', type: 'desktop', browser: 'Chrome 120', os: 'Windows 11', lastActive: 'Now', trusted: true, current: true },
  { id: 2, name: 'iPhone 15 Pro', type: 'mobile', browser: 'Safari 17', os: 'iOS 17.2', lastActive: '2 hours ago', trusted: true, current: false },
  { id: 3, name: 'MacBook Pro', type: 'laptop', browser: 'Firefox 121', os: 'macOS 14', lastActive: '1 day ago', trusted: true, current: false },
];

function TrustedDevices() {
  const [devices, setDevices] = useState(DEMO_DEVICES);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRevokeTrust = (deviceId) => {
    if (window.confirm('Are you sure you want to revoke trust for this device?')) {
      setDevices(devices.map(d => 
        d.id === deviceId ? { ...d, trusted: false } : d
      ));
    }
  };

  const handleRestoreTrust = (deviceId) => {
    setDevices(devices.map(d => 
      d.id === deviceId ? { ...d, trusted: true } : d
    ));
  };

  const handleRemoveDevice = (deviceId) => {
    if (window.confirm('Remove this device from your trusted list?')) {
      setDevices(devices.filter(d => d.id !== deviceId));
    }
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'desktop': return '🖥️';
      case 'laptop': return '💻';
      case 'mobile': return '📱';
      case 'tablet': return '📲';
      default: return '📟';
    }
  };

  // Calculate trust ratio using φ
  const trustedCount = devices.filter(d => d.trusted).length;
  const trustRatio = devices.length > 0 ? (trustedCount / devices.length * BASE_RATIO).toFixed(3) : 0;

  return (
    <div className="trusted-devices-container">
      <div className="devices-header">
        <div>
          <h2>📱 Trusted Devices</h2>
          <p className="devices-subtitle">
            Manage devices authorized to access your Solidarity account
          </p>
        </div>
        <button className="add-device-btn" onClick={() => setShowAddModal(true)}>
          + Add Device
        </button>
      </div>

      {/* Trust Stats */}
      <div className="trust-stats">
        <div className="trust-stat">
          <span className="stat-value">{devices.length}</span>
          <span className="stat-label">Total Devices</span>
        </div>
        <div className="trust-stat">
          <span className="stat-value trusted">{trustedCount}</span>
          <span className="stat-label">Trusted</span>
        </div>
        <div className="trust-stat">
          <span className="stat-value">{trustRatio}</span>
          <span className="stat-label">Trust Ratio (φ)</span>
        </div>
      </div>

      {/* Device List */}
      <div className="devices-list">
        {loading ? (
          <div className="loading-state">
            <p>Loading devices...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="empty-state">
            <p>No devices registered yet.</p>
            <button onClick={() => setShowAddModal(true)}>Add Your First Device</button>
          </div>
        ) : (
          devices.map(device => (
            <div key={device.id} className={`device-card ${device.current ? 'current' : ''}`}>
              <div className="device-icon">{getDeviceIcon(device.type)}</div>
              <div className="device-info">
                <div className="device-name">
                  {device.name}
                  {device.current && <span className="current-badge">This Device</span>}
                </div>
                <div className="device-details">
                  {device.browser} • {device.os}
                </div>
                <div className="device-last-active">
                  Last active: {device.lastActive}
                </div>
              </div>
              <div className="device-status">
                <span className={`trust-badge ${device.trusted ? 'trusted' : 'revoked'}`}>
                  {device.trusted ? '✓ Trusted' : '✗ Revoked'}
                </span>
              </div>
              <div className="device-actions">
                {device.trusted ? (
                  <button 
                    className="action-btn revoke"
                    onClick={() => handleRevokeTrust(device.id)}
                    disabled={device.current}
                  >
                    Revoke
                  </button>
                ) : (
                  <button 
                    className="action-btn restore"
                    onClick={() => handleRestoreTrust(device.id)}
                  >
                    Restore
                  </button>
                )}
                {!device.current && (
                  <button 
                    className="action-btn remove"
                    onClick={() => handleRemoveDevice(device.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Security Tips */}
      <div className="security-tips">
        <h4>🔐 Security Tips</h4>
        <ul>
          <li>Regularly review your trusted devices</li>
          <li>Revoke access for devices you no longer use</li>
          <li>Enable 2FA for additional protection</li>
          <li>Trust ratio above {BRIDGING_BASELINE} indicates healthy security</li>
        </ul>
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Add New Device</h3>
            <p>Scan this QR code on your other device to add it as trusted:</p>
            <div className="qr-placeholder">
              <span>📱 QR Code</span>
              <p>Feature coming soon</p>
            </div>
            <button className="modal-close" onClick={() => setShowAddModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrustedDevices;
