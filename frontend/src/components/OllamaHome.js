/*
 * SOLIDARITY PLATFORM - OLLAMA AI HOMEPAGE
 * =========================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

import React, { useState, useEffect, useRef } from 'react';
import './OllamaHome.css';
import { API_BASE_URL } from '../config/api';

const OllamaHome = ({ safetyLevel = 0.618, userPermissions = {} }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [liveData, setLiveData] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  // Suggested prompts for new users
  const suggestedPrompts = [
    "What's the current state of crypto markets?",
    "Show me investment opportunities within my budget",
    "What's the latest financial news in my area?",
    "Explain how the φ-ratio works in this platform",
    "Help me understand my Hanko stamps",
    "What can this platform do for me?"
  ];

  // Fetch live data for Ollama context
  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchLiveData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/ai/live-context`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLiveData(data);
    } catch (error) {
      console.error('Failed to fetch live data:', error);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to Ollama
  const sendMessage = async (prompt = inputValue) => {
    if (!prompt.trim()) return;

    const userMessage = { role: 'user', content: prompt, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: prompt,
          safetyLevel,
          liveData,
          userPermissions
        })
      });

      const data = await response.json();
      const aiMessage = { 
        role: 'assistant', 
        content: data.response, 
        timestamp: new Date(),
        metadata: data.metadata
      };
      setMessages(prev => [...prev, aiMessage]);

      // Log interaction
      await fetch(`${API_BASE_URL}/api/logs/activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'ollama',
          actor: 'ollama',
          action: 'ai_response',
          details: JSON.stringify({ prompt: prompt.substring(0, 100), responseLength: data.response.length })
        })
      });
    } catch (error) {
      console.error('Ollama error:', error);
      const errorMessage = { 
        role: 'error', 
        content: 'Sorry, I encountered an error. Please try again.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ollama-home">
      {/* Sacred Geometry Background */}
      <div className="sacred-geometry-bg"></div>

      {/* Settings Button (Top Right) */}
      <button 
        className="settings-btn"
        onClick={() => setShowSettings(true)}
        title="Settings"
      >
        ⚙️
      </button>

      {/* Chat Container */}
      <div className="chat-container">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="welcome-screen">
            <div className="welcome-logo">🤖</div>
            <h1 className="welcome-title">Welcome to Solidarity Platform</h1>
            <p className="welcome-subtitle">
              Powered by Ollama AI • φ-Ratio Intelligence • Live Market Data
            </p>

            {/* Live Data Preview */}
            {liveData.crypto && (
              <div className="live-data-preview">
                <h3>📊 Live Market Overview</h3>
                <div className="live-data-grid">
                  {liveData.crypto?.top5 && liveData.crypto.top5.map((coin, idx) => (
                    <div key={idx} className="live-data-item">
                      <span className="coin-name">{coin.symbol}</span>
                      <span className={`coin-change ${coin.change24h > 0 ? 'positive' : 'negative'}`}>
                        {coin.change24h > 0 ? '▲' : '▼'} {Math.abs(coin.change24h).toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Prompts */}
            <div className="suggested-prompts">
              <h3>💡 Try asking:</h3>
              <div className="prompts-grid">
                {suggestedPrompts.map((prompt, idx) => (
                  <button 
                    key={idx}
                    className="prompt-suggestion"
                    onClick={() => sendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Message History
          <div className="messages-list">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'user' ? '👤' : msg.role === 'assistant' ? '🤖' : '⚠️'}
                </div>
                <div className="message-content">
                  <div className="message-text">{msg.content}</div>
                  <div className="message-timestamp">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                  {msg.metadata && (
                    <div className="message-metadata">
                      <span>Model: {msg.metadata.model}</span>
                      <span>Safety: {(msg.metadata.safetyLevel * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant loading">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="input-container">
        <div className="safety-indicator">
          <span className="indicator-icon">🛡️</span>
          <span className="indicator-text">
            Safety: {(safetyLevel * 100).toFixed(0)}%
          </span>
        </div>
        <div className="input-wrapper">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about markets, investments, platform features..."
            className="chat-input"
            rows="1"
            disabled={isLoading}
          />
          <button 
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
};

// Settings Panel Component
const SettingsPanel = ({ onClose }) => {
  const [theme, setTheme] = useState('default');
  const [fontSize, setFontSize] = useState(16);
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    // Load user settings
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/user/settings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setTheme(data.theme || 'default');
      setFontSize(data.fontSize || 16);
      setUserInfo(data.userInfo || {});
    });
  }, []);

  const saveSettings = async () => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE_URL}/api/user/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ theme, fontSize, userInfo })
    });
    alert('✅ Settings saved!');
  };

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <button className="close-settings" onClick={onClose}>✕</button>
        
        <h2>⚙️ Settings</h2>

        {/* Theme Selection */}
        <div className="setting-section">
          <label>🎨 Theme</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="default">Default (Golden)</option>
            <option value="dark">Dark Mode</option>
            <option value="sacred">Sacred Geometry</option>
            <option value="matrix">Matrix Green</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="setting-section">
          <label>🔤 Font Size: {fontSize}px</label>
          <input 
            type="range" 
            min="12" 
            max="24" 
            value={fontSize} 
            onChange={(e) => setFontSize(e.target.value)}
          />
        </div>

        {/* User Info */}
        <div className="setting-section">
          <label>📧 Email</label>
          <input 
            type="email" 
            value={userInfo.email || ''} 
            onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
          />
        </div>

        <div className="setting-section">
          <label>📱 Phone</label>
          <input 
            type="tel" 
            value={userInfo.phone || ''} 
            onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
          />
        </div>

        {/* Actions */}
        <button className="btn-change-passcode" onClick={() => alert('Passcode change feature coming soon!')}>
          🔐 Change Passcode
        </button>

        <button className="btn-request-hanko" onClick={() => window.location.hash = '#hanko-stamps'}>
          🎴 Request New Hanko Stamp
        </button>

        <button className="btn-save-settings" onClick={saveSettings}>
          💾 Save Settings
        </button>
      </div>
    </div>
  );
};

export default OllamaHome;

