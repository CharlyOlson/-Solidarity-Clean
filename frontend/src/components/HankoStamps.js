/*
 * SOLIDARITY PLATFORM - HANKO STAMPS TAB
 * =======================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

import React, { useState, useEffect } from 'react';
import './HankoStamps.css';

const HankoStamps = () => {
  const [stamps, setStamps] = useState([]);
  const [selectedStamp, setSelectedStamp] = useState(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestType, setRequestType] = useState('personal');

  // Hanko stamp types with Japanese characters and descriptions
  const stampTypes = {
    personal: {
      name: 'Personal Seal',
      japanese: '個人印',
      romaji: 'kojin-in',
      description: 'For general authentication and platform access',
      color: '#4CAF50',
      icon: '🟢',
      visual: '○'
    },
    registered: {
      name: 'Registered Seal',
      japanese: '実印',
      romaji: 'jitsuin',
      description: 'For high-security transactions and contracts',
      color: '#F44336',
      icon: '🔴',
      visual: '◉'
    },
    bank: {
      name: 'Bank Seal',
      japanese: '銀行印',
      romaji: 'ginkoin',
      description: 'For financial transactions and wallet operations',
      color: '#2196F3',
      icon: '🔵',
      visual: '◎'
    },
    company: {
      name: 'Company Seal',
      japanese: '社印',
      romaji: 'shain',
      description: 'For business-related authorizations',
      color: '#FF9800',
      icon: '🟠',
      visual: '◈'
    }
  };

  // Fetch user's Hanko stamps
  useEffect(() => {
    fetchStamps();
  }, []);

  const fetchStamps = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/hanko/my-stamps', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setStamps(data.stamps || []);
    } catch (error) {
      console.error('Failed to fetch stamps:', error);
    }
  };

  // Request new Hanko stamp
  const requestNewStamp = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/hanko/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: requestType })
      });

      if (response.ok) {
        alert(`✅ ${stampTypes[requestType].name} created successfully!`);
        fetchStamps();
        setShowRequestDialog(false);
      } else {
        alert('❌ Failed to create stamp');
      }
    } catch (error) {
      console.error('Stamp creation error:', error);
      alert('❌ Failed to create stamp');
    }
  };

  // Revoke stamp
  const revokeStamp = async (stampId) => {
    if (!window.confirm('⚠️ Are you sure you want to revoke this stamp? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/hanko/revoke/${stampId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchStamps();
      setSelectedStamp(null);
    } catch (error) {
      console.error('Revoke error:', error);
    }
  };

  // View stamp details
  const viewStampDetails = (stamp) => {
    setSelectedStamp(stamp);
  };

  return (
    <div className="hanko-stamps-container">
      {/* Header */}
      <div className="hanko-header">
        <div className="hanko-title">
          <h1>🎴 Hanko Stamps</h1>
          <p className="hanko-subtitle">Japanese-Style Digital Authentication Seals</p>
        </div>
        <button 
          className="btn-request-stamp"
          onClick={() => setShowRequestDialog(true)}
        >
          ➕ Request New Stamp
        </button>
      </div>

      {/* Stamp Types Info */}
      <div className="stamp-types-info">
        <h3>📘 Stamp Types</h3>
        <div className="stamp-types-grid">
          {Object.entries(stampTypes).map(([key, type]) => (
            <div key={key} className="stamp-type-card" style={{ borderColor: type.color }}>
              <div className="stamp-visual" style={{ color: type.color }}>
                {type.visual}
              </div>
              <div className="stamp-type-info">
                <div className="stamp-name" style={{ color: type.color }}>
                  {type.name}
                </div>
                <div className="stamp-japanese">
                  {type.japanese} ({type.romaji})
                </div>
                <div className="stamp-description">
                  {type.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User's Stamps */}
      <div className="user-stamps-section">
        <h3>🎴 Your Stamps ({stamps.filter(s => !s.revoked).length} Active)</h3>
        
        {stamps.length === 0 ? (
          <div className="no-stamps">
            <div className="no-stamps-icon">🎴</div>
            <p>You don't have any Hanko stamps yet</p>
            <button 
              className="btn-create-first"
              onClick={() => setShowRequestDialog(true)}
            >
              Create Your First Stamp
            </button>
          </div>
        ) : (
          <div className="stamps-grid">
            {stamps.map((stamp) => {
              const type = stampTypes[stamp.stamp_type] || stampTypes.personal;
              return (
                <div 
                  key={stamp.stamp_id}
                  className={`stamp-card ${stamp.revoked ? 'revoked' : ''}`}
                  onClick={() => viewStampDetails(stamp)}
                  style={{ borderColor: type.color }}
                >
                  {/* Display actual SVG from Python hanko engine */}
                  {stamp.svg ? (
                    <div 
                      className="stamp-svg-container"
                      dangerouslySetInnerHTML={{ __html: stamp.svg }}
                    />
                  ) : (
                    <div className="stamp-badge" style={{ backgroundColor: type.color }}>
                      <div className="stamp-visual-large">
                        {type.visual}
                      </div>
                      <div className="stamp-japanese-text">
                        {type.japanese}
                      </div>
                    </div>
                  )}
                  
                  <div className="stamp-card-info">
                    <div className="stamp-card-name">
                      {type.name}
                    </div>
                    <div className="stamp-card-meta">
                      <span>🔢 ID: {stamp.stamp_id.substring(0, 8)}...</span>
                      <span>📅 {stamp.date}</span>
                    </div>
                    <div className="stamp-usage-stats">
                      <div className="usage-stat">
                        <span className="stat-label">Times Used:</span>
                        <span className="stat-value">{stamp.usage_count || 0}</span>
                      </div>
                      {stamp.last_used && (
                        <div className="usage-stat">
                          <span className="stat-label">Last Used:</span>
                          <span className="stat-value">
                            {new Date(stamp.last_used).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="stamp-crypto-badge">
                      🔐 Quantum-Resistant SHA-3
                    </div>
                    {stamp.revoked && (
                      <div className="revoked-badge">
                        ❌ REVOKED
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request New Stamp Dialog */}
      {showRequestDialog && (
        <div className="request-dialog-overlay">
          <div className="request-dialog">
            <h2>➕ Request New Hanko Stamp</h2>
            <p className="dialog-subtitle">Select the type of stamp you need:</p>
            
            <div className="stamp-type-selector">
              {Object.entries(stampTypes).map(([key, type]) => (
                <div 
                  key={key}
                  className={`stamp-type-option ${requestType === key ? 'selected' : ''}`}
                  onClick={() => setRequestType(key)}
                  style={{ 
                    borderColor: requestType === key ? type.color : 'rgba(255,255,255,0.2)',
                    backgroundColor: requestType === key ? `${type.color}20` : 'transparent'
                  }}
                >
                  <div className="option-visual" style={{ color: type.color }}>
                    {type.visual}
                  </div>
                  <div className="option-name" style={{ color: type.color }}>
                    {type.name}
                  </div>
                  <div className="option-japanese">
                    {type.japanese}
                  </div>
                  <div className="option-description">
                    {type.description}
                  </div>
                </div>
              ))}
            </div>

            <div className="dialog-actions">
              <button 
                className="btn-create-stamp"
                onClick={requestNewStamp}
              >
                🎴 Create Stamp
              </button>
              <button 
                className="btn-cancel"
                onClick={() => setShowRequestDialog(false)}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stamp Details Modal */}
      {selectedStamp && (
        <div className="stamp-details-overlay">
          <div className="stamp-details-modal">
            <button 
              className="close-details"
              onClick={() => setSelectedStamp(null)}
            >
              ✕
            </button>

            <div className="stamp-details-header">
              {/* Display SVG stamp */}
              {selectedStamp.svg && (
                <div 
                  className="details-svg-large"
                  dangerouslySetInnerHTML={{ __html: selectedStamp.svg }}
                />
              )}
              <div className="details-title">
                <h2>{stampTypes[selectedStamp.stamp_type].name}</h2>
                <p className="details-romaji">
                  {stampTypes[selectedStamp.stamp_type].romaji} - {stampTypes[selectedStamp.stamp_type].japanese}
                </p>
                <div className="crypto-info">
                  🔐 Quantum-Resistant • φ 1.618 • SHA-3-512
                </div>
              </div>
            </div>

            <div className="stamp-details-content">
              <div className="detail-section">
                <label>Stamp ID</label>
                <div className="detail-value monospace">{selectedStamp.stamp_id}</div>
              </div>

              <div className="detail-section">
                <label>Date Created</label>
                <div className="detail-value">{selectedStamp.date}</div>
              </div>

              <div className="detail-section">
                <label>Base Hash (SHA3-512)</label>
                <div className="detail-value monospace small-text">
                  {selectedStamp.base_hash_b64}
                </div>
              </div>

              <div className="detail-section">
                <label>SVG Hash (SHA3-256)</label>
                <div className="detail-value monospace small-text">
                  {selectedStamp.svg_hash_b64}
                </div>
              </div>

              <div className="detail-section">
                <label>Digital Signature (Ed25519)</label>
                <div className="detail-value monospace small-text">
                  {selectedStamp.signature_b64}
                </div>
              </div>

              <div className="detail-section">
                <label>Algorithm Version</label>
                <div className="detail-value">
                  {selectedStamp.algo_version || 'hanko-v1'}
                </div>
              </div>

              <div className="detail-section">
                <label>Usage Statistics</label>
                <div className="usage-details">
                  <div>Times Used: <strong>{selectedStamp.usage_count || 0}</strong></div>
                  {selectedStamp.last_used && (
                    <div>
                      Last Used: <strong>{new Date(selectedStamp.last_used).toLocaleString()}</strong>
                    </div>
                  )}
                  <div>Created: <strong>{new Date(selectedStamp.created_at).toLocaleString()}</strong></div>
                </div>
              </div>

              {!selectedStamp.revoked && (
                <button 
                  className="btn-revoke"
                  onClick={() => revokeStamp(selectedStamp.stamp_id)}
                >
                  🚫 Revoke This Stamp
                </button>
              )}

              {selectedStamp.revoked && (
                <div className="revoked-warning">
                  ❌ This stamp has been revoked on {new Date(selectedStamp.revoked_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HankoStamps;

