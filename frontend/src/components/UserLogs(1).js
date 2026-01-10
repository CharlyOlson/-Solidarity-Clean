/*
 * SOLIDARITY PLATFORM - USER LOGS TAB
 * ====================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

import React, { useState, useEffect } from 'react';
import './UserLogs.css';
import { API_BASE_URL } from '../config/api';

const UserLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  // Log types with icons
  const logTypes = {
    user: { icon: '👤', label: 'User Action', color: '#4CAF50' },
    ollama: { icon: '🤖', label: 'Ollama AI', color: '#2196F3' },
    transaction: { icon: '💰', label: 'Transaction', color: '#FFD700' },
    device: { icon: '📱', label: 'Device', color: '#9C27B0' },
    hanko: { icon: '🎴', label: 'Hanko Stamp', color: '#FF5722' },
    security: { icon: '🛡️', label: 'Security', color: '#F44336' },
    settings: { icon: '⚙️', label: 'Settings', color: '#607D8B' },
    quipnotes: { icon: '📝', label: 'QuipNotes', color: '#00BCD4' }
  };

  // Fetch logs from API
  useEffect(() => {
    fetchLogs();
    // Poll for new logs every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logs/activity`);
      const data = await response.json();
      setLogs(data.logs || []);
      applyFilters(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  // Apply filters
  const applyFilters = (logList = logs) => {
    let filtered = logList;

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(log => log.type === filterType);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  };

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, searchQuery, logs]);

  // Download logs to device
  const downloadLogs = () => {
    const data = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solidarity-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Log the download action
    logActivity('user', 'logs_downloaded', { count: filteredLogs.length });
  };

  // Email logs to user
  const emailLogs = async () => {
    if (!userEmail) {
      setShowEmailDialog(true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/logs/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          logs: filteredLogs,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        alert(`✅ Logs emailed to ${userEmail}`);
        logActivity('user', 'logs_emailed', { email: userEmail, count: filteredLogs.length });
      } else {
        alert('❌ Failed to send email');
      }
    } catch (error) {
      console.error('Email error:', error);
      alert('❌ Failed to send email');
    }
  };

  // Log activity helper
  const logActivity = async (actor, action, details) => {
    try {
      await fetch(`${API_BASE_URL}/api/logs/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: actor === 'ollama' ? 'ollama' : 'user',
          actor,
          action,
          details: JSON.stringify(details),
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Clear specific log
  const deleteLog = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;

    try {
      await fetch(`${API_BASE_URL}/api/logs/activity/${logId}`, {
        method: 'DELETE'
      });
      fetchLogs();
      logActivity('user', 'log_deleted', { logId });
    } catch (error) {
      console.error('Failed to delete log:', error);
    }
  };

  // Clear all logs
  const clearAllLogs = async () => {
    if (!window.confirm('⚠️ WARNING: This will permanently delete ALL logs. Are you sure?')) return;

    try {
      await fetch(`${API_BASE_URL}/api/logs/clear`, {
        method: 'DELETE'
      });
      setLogs([]);
      setFilteredLogs([]);
      logActivity('user', 'all_logs_cleared', { count: logs.length });
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  return (
    <div className="user-logs-container">
      {/* Header */}
      <div className="logs-header">
        <div className="logs-title">
          <h1>📋 User Logs</h1>
          <p className="logs-subtitle">Complete activity history • User + Ollama movements</p>
        </div>
        <div className="logs-stats">
          <div className="stat">
            <span className="stat-value">{logs.length}</span>
            <span className="stat-label">Total Logs</span>
          </div>
          <div className="stat">
            <span className="stat-value">{filteredLogs.length}</span>
            <span className="stat-label">Filtered</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="logs-controls">
        <div className="filter-section">
          <label>Filter by Type:</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            {Object.entries(logTypes).map(([key, type]) => (
              <option key={key} value={key}>{type.icon} {type.label}</option>
            ))}
          </select>
        </div>

        <div className="search-section">
          <input
            type="text"
            placeholder="🔍 Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="action-buttons">
          <button className="btn-download" onClick={downloadLogs}>
            💾 Download
          </button>
          <button className="btn-email" onClick={emailLogs}>
            📧 Email
          </button>
          <button className="btn-clear" onClick={clearAllLogs}>
            🗑️ Clear All
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="logs-list">
        {filteredLogs.length === 0 ? (
          <div className="no-logs">
            <div className="no-logs-icon">📭</div>
            <p>No logs match your filters</p>
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const logType = logTypes[log.type] || logTypes.user;
            return (
              <div key={index} className="log-entry" style={{ borderLeftColor: logType.color }}>
                <div className="log-icon" style={{ color: logType.color }}>
                  {logType.icon}
                </div>
                <div className="log-content">
                  <div className="log-header-row">
                    <span className="log-type-label" style={{ color: logType.color }}>
                      {logType.label}
                    </span>
                    <span className="log-timestamp">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="log-action">
                    {log.action.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  {log.details && (
                    <div className="log-details">
                      {typeof log.details === 'string' 
                        ? log.details 
                        : JSON.stringify(log.details, null, 2)
                      }
                    </div>
                  )}
                </div>
                <button 
                  className="log-delete-btn"
                  onClick={() => deleteLog(log.id)}
                  title="Delete log"
                >
                  ❌
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Email Dialog */}
      {showEmailDialog && (
        <div className="email-dialog-overlay">
          <div className="email-dialog">
            <h2>📧 Email Logs</h2>
            <p>Enter your email address to receive the logs:</p>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="email-input"
            />
            <div className="dialog-actions">
              <button 
                className="btn-send"
                onClick={() => {
                  setShowEmailDialog(false);
                  emailLogs();
                }}
              >
                Send
              </button>
              <button 
                className="btn-cancel"
                onClick={() => setShowEmailDialog(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLogs;

