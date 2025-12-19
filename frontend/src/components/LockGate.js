/*
 * SOLIDARITY PLATFORM - LOCKGATE SECURITY OVERLAY
 * ================================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

import React, { useState, useEffect } from 'react';
import './LockGate.css';

const LockGate = ({ safetyLevel = 0.618 }) => {
  const [securityState, setSecurityState] = useState('locked'); // locked, secured, warning, critical
  const [lastScanTime, setLastScanTime] = useState(null);
  const [intrustionAttempts, setIntrusionAttempts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [burnProtocolActive, setBurnProtocolActive] = useState(false);

  // Security states with visual indicators
  const securityStates = {
    secured: {
      color: '#4CAF50',
      icon: '🔓',
      label: 'SECURED',
      opacity: 0.75,
      flash: true // Momentary green flash
    },
    locked: {
      color: '#FFD700',
      icon: '🔒',
      label: 'LOCKED',
      opacity: 0.75,
      flash: false
    },
    warning: {
      color: '#FF9800',
      icon: '⚠️',
      label: 'INTRUSION DETECTED',
      opacity: 1.0,
      flash: false,
      popup: true
    },
    critical: {
      color: '#F44336',
      icon: '🔥',
      label: 'BURN PROTOCOL',
      opacity: 1.0,
      flash: false,
      burn: true
    }
  };

  // Monitor security threats
  useEffect(() => {
    const checkSecurity = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/security/status');
        const data = await response.json();

        // Update security state based on threats
        if (data.burnProtocolNeeded) {
          setSecurityState('critical');
          setBurnProtocolActive(true);
        } else if (data.intrusionAttempts > 0) {
          setSecurityState('warning');
          setIntrusionAttempts(data.attempts || []);
          setShowPopup(true);
        } else if (data.recentScan) {
          setSecurityState('secured');
          setLastScanTime(new Date());
          // Flash green for 3 seconds then return to locked
          setTimeout(() => setSecurityState('locked'), 3000);
        } else {
          setSecurityState('locked');
        }
      } catch (error) {
        console.error('Security check failed:', error);
      }
    };

    // Check security every 2 seconds
    checkSecurity();
    const interval = setInterval(checkSecurity, 2000);
    return () => clearInterval(interval);
  }, []);

  // Burn Protocol - ERASE AND RESTART
  const executeBurnProtocol = async () => {
    if (!window.confirm('⚠️ CRITICAL SECURITY ALERT\n\nThis will:\n• Secure all logs\n• Erase system content and downloads\n• Restart system\n• Rebuild user settings (clean, no corruption)\n\nContinue?')) {
      return;
    }

    try {
      // Step 1: Secure logs
      await fetch('http://localhost:3001/api/security/secure-logs', { method: 'POST' });

      // Step 2: Erase content
      await fetch('http://localhost:3001/api/security/erase-content', { method: 'POST' });

      // Step 3: Clean rebuild
      await fetch('http://localhost:3001/api/security/rebuild-clean', { method: 'POST' });

      // Step 4: Restart
      alert('🔥 Burn protocol complete. System will restart...');
      window.location.href = '/login';
    } catch (error) {
      console.error('Burn protocol error:', error);
      alert('❌ Burn protocol failed. Contact admin.');
    }
  };

  // Dismiss intrusion popup
  const dismissPopup = () => {
    setShowPopup(false);
    setSecurityState('locked');
  };

  const currentState = securityStates[securityState];

  return (
    <>
      {/* Fixed Security Overlay - Bottom Right */}
      <div 
        className={`lockgate-overlay ${securityState}`}
        style={{
          backgroundColor: currentState.color,
          opacity: currentState.opacity
        }}
      >
        <div className="lockgate-icon">
          {currentState.icon}
        </div>
        <div className="lockgate-label">
          {currentState.label}
        </div>
        {securityState === 'secured' && lastScanTime && (
          <div className="lockgate-timestamp">
            Scanned: {lastScanTime.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Intrusion Popup (Orange State) */}
      {showPopup && securityState === 'warning' && (
        <div className="intrusion-popup-overlay">
          <div className="intrusion-popup">
            <h2>⚠️ SECURITY ALERT</h2>
            <p className="alert-message">
              Intrusion attempts detected on your system
            </p>
            
            <div className="attempts-list">
              <h3>Detected Attempts:</h3>
              {intrustionAttempts.map((attempt, idx) => (
                <div key={idx} className="attempt-item">
                  <span className="attempt-icon">🚨</span>
                  <div className="attempt-details">
                    <div className="attempt-type">{attempt.type}</div>
                    <div className="attempt-timestamp">
                      {new Date(attempt.timestamp).toLocaleString()}
                    </div>
                    <div className="attempt-info">{attempt.details}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="popup-actions">
              <button 
                className="btn-block"
                onClick={() => {
                  fetch('http://localhost:3001/api/security/block-threat', { method: 'POST' });
                  dismissPopup();
                }}
              >
                🛡️ Block Threat
              </button>
              <button 
                className="btn-investigate"
                onClick={() => {
                  window.location.hash = '#user-logs';
                  dismissPopup();
                }}
              >
                🔍 View Full Logs
              </button>
              <button 
                className="btn-dismiss"
                onClick={dismissPopup}
              >
                ❌ Dismiss
              </button>
            </div>

            <p className="popup-note">
              All attempts have been logged to User Logs
            </p>
          </div>
        </div>
      )}

      {/* Burn Protocol Screen (Red State) */}
      {burnProtocolActive && securityState === 'critical' && (
        <div className="burn-protocol-overlay">
          <div className="burn-protocol-screen">
            <div className="burn-icon">🔥</div>
            <h1>CRITICAL SECURITY BREACH</h1>
            <p className="burn-message">
              Multiple unauthorized access attempts detected.<br />
              System integrity compromised.
            </p>

            <div className="burn-details">
              <div className="burn-detail-item">
                <span className="icon">🔒</span>
                <span>Secure all logs</span>
              </div>
              <div className="burn-detail-item">
                <span className="icon">🗑️</span>
                <span>Erase system content and downloads</span>
              </div>
              <div className="burn-detail-item">
                <span className="icon">🔄</span>
                <span>Restart system</span>
              </div>
              <div className="burn-detail-item">
                <span className="icon">✨</span>
                <span>Rebuild clean settings (no corruption)</span>
              </div>
            </div>

            <button 
              className="btn-burn"
              onClick={executeBurnProtocol}
            >
              🔥 EXECUTE BURN PROTOCOL
            </button>

            <p className="burn-warning">
              ⚠️ This action is irreversible and will restart the system
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default LockGate;

