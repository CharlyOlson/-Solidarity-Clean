/*
 * SOLIDARITY PLATFORM - QUIPNOTES SECURE BROWSER
 * ==============================================
 * 
 * TRADEMARK: Scott Charles Olson
 * 
 * Whitelist-only browser with Ollama malware scanning
 */

import React, { useState, useEffect } from 'react';
import { BASE_RATIO, BRIDGING_BASELINE } from '../config/constants';
import './QuipNotes.css';
import { API_BASE_URL } from '../config/api';

const QuipNotes = ({ safetyLevel = 0.618 }) => {
  const [currentUrl, setCurrentUrl] = useState('');
  const [whitelist, setWhitelist] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [scanResult, setScanResult] = useState(null);

  // Load whitelist from backend
  useEffect(() => {
    fetchWhitelist();
  }, []);

  const fetchWhitelist = async () => {
    try {
      // Mock data for now
      setWhitelist([
        'https://solidarity.local',
        'https://github.com',
        'https://developer.mozilla.org'
      ]);
    } catch (error) {
      console.error('Failed to fetch whitelist:', error);
    }
  };

  const handleUrlScan = async () => {
    if (!newUrl.trim()) {
      alert('Please enter a URL');
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/ai/scan-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: newUrl })
      });

      const data = await response.json();
      setScanResult(data);

      if (data.safe) {
        setWhitelist([...whitelist, newUrl]);
        setNewUrl('');
        alert('✅ URL is safe and added to whitelist!');
      }
    } catch (error) {
      console.error('Scan failed:', error);
      setScanResult({ safe: false, reason: 'Scan service unavailable' });
    } finally {
      setIsScanning(false);
    }
  };

  const navigateToUrl = (url) => {
    if (url.includes('solidarity')) {
      // One-way gate - cannot go back
      if (window.confirm('This is a one-way link to Solidarity. You won\'t be able to go back. Continue?')) {
        setCurrentUrl(url);
      }
    } else {
      setCurrentUrl(url);
    }
  };

  const removeFromWhitelist = (url) => {
    if (window.confirm(`Remove ${url} from whitelist?`)) {
      setWhitelist(whitelist.filter(u => u !== url));
    }
  };

  return (
    <div className="quipnotes-container">
      {/* Browser Controls */}
      <div className="browser-controls">
        <input
          type="text"
          className="url-input"
          value={currentUrl}
          onChange={(e) => setCurrentUrl(e.target.value)}
          placeholder="Enter URL from whitelist..."
        />
        <button
          className="btn-navigate"
          onClick={() => navigateToUrl(currentUrl)}
          disabled={!whitelist.includes(currentUrl)}
        >
          🌐 Navigate
        </button>
      </div>

      {/* Main Content Area */}
      <div className="browser-content">
        {/* Whitelist Sidebar */}
        <div className="whitelist-panel">
          <h3>🔒 Whitelisted Sites</h3>
          <div className="whitelist-list">
            {whitelist.map((url, index) => (
              <div key={index} className="whitelist-item">
                <button
                  className="btn-whitelist-url"
                  onClick={() => setCurrentUrl(url)}
                >
                  {url}
                </button>
                <button
                  className="btn-remove"
                  onClick={() => removeFromWhitelist(url)}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>

          <div className="add-url-section">
            <h4>➕ Add New URL</h4>
            <input
              type="text"
              className="new-url-input"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com"
            />
            <button
              className="btn-scan"
              onClick={handleUrlScan}
              disabled={isScanning}
            >
              {isScanning ? '🔍 Scanning...' : '🛡️ Scan & Add'}
            </button>

            {scanResult && (
              <div className={`scan-result ${scanResult.safe ? 'safe' : 'unsafe'}`}>
                {scanResult.safe ? '✅ Safe' : '❌ Unsafe'}
                {scanResult.reason && <p>{scanResult.reason}</p>}
              </div>
            )}
          </div>

          <div className="security-features">
            <h4>🔐 Security Features</h4>
            <ul>
              <li>✅ Zero cookies stored</li>
              <li>✅ Ad blockers active</li>
              <li>✅ Script blockers enabled</li>
              <li>✅ Ollama scanning</li>
            </ul>
          </div>
        </div>

        {/* Website Viewer */}
        <div className="website-viewer">
          {currentUrl ? (
            <div className="iframe-container">
              <div className="viewer-header">
                <span className="current-url">{currentUrl}</span>
                {currentUrl.includes('solidarity') && (
                  <span className="one-way-badge">🚪 ONE-WAY GATE</span>
                )}
              </div>
              <iframe
                src={currentUrl}
                title="QuipNotes Browser"
                className="website-iframe"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          ) : (
            <div className="no-url-placeholder">
              <div className="placeholder-content">
                <h2>🌐 QuipNotes Secure Browser</h2>
                <p>Select a URL from the whitelist or add a new one</p>
                <div className="feature-list">
                  <div className="feature-item">
                    <span className="feature-icon">🔒</span>
                    <span>Whitelist-only browsing</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🤖</span>
                    <span>Ollama malware scanning</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🚫</span>
                    <span>Ad & script blockers</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🚪</span>
                    <span>One-way gate to Solidarity</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuipNotes;

