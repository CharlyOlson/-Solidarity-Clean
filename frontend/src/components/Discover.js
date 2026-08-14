/*
 * SOLIDARITY PLATFORM - DISCOVER COMPONENT
 * =========================================
 * 
 * TRADEMARK: Scott Charles Olson


 */

import React, { useState } from 'react';
import './Discover.css';

const BASE_RATIO = 1.618;
const BRIDGING_BASELINE = 0.618;

// Featured apps/protocols
const FEATURED_ITEMS = [
  { id: 1, name: 'DeFi Bridge', category: 'defi', icon: '🌉', description: 'Cross-chain asset bridging with φ-ratio optimization', users: 12400 },
  { id: 2, name: 'NFT Gallery', category: 'nft', icon: '🖼️', description: 'Curated NFT collections with geometric numerics', users: 8900 },
  { id: 3, name: 'DAO Voting', category: 'dao', icon: '🗳️', description: 'Decentralized governance using Henry 7-14-49', users: 5600 },
  { id: 4, name: 'Yield Optimizer', category: 'defi', icon: '📈', description: 'Auto-compounding with golden ratio strategies', users: 15200 },
  { id: 5, name: 'Soul Staking', category: 'staking', icon: '💎', description: 'Stake tokens with bridging baseline rewards', users: 21000 },
  { id: 6, name: 'Privacy Mixer', category: 'privacy', icon: '🔐', description: 'Enhanced transaction privacy protocols', users: 3400 },
];

const CATEGORIES = ['all', 'defi', 'nft', 'dao', 'staking', 'privacy', 'social'];

const TRENDING_TOPICS = [
  { tag: '#GoldenRatio', count: 2847 },
  { tag: '#SolidarityNode', count: 1923 },
  { tag: '#PhiOptimized', count: 1456 },
  { tag: '#Henry749', count: 892 },
];

function Discover() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [items] = useState(FEATURED_ITEMS);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate ecosystem stats using φ-ratio
  const totalUsers = items.reduce((sum, item) => sum + item.users, 0);
  const avgEngagement = Math.round(totalUsers / items.length * BRIDGING_BASELINE);

  return (
    <div className="discover-container">
      <div className="discover-header">
        <h2>🔍 Discover</h2>
        <p className="discover-subtitle">
          Explore apps, protocols, and integrations in the Solidarity ecosystem
        </p>
      </div>

      {/* Search Bar */}
      <div className="discover-search">
        <input
          type="text"
          placeholder="Search apps, protocols, features..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      {/* Category Pills */}
      <div className="category-pills">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="discover-content">
        {/* Main Grid */}
        <div className="discover-main">
          <h3 className="section-title">Featured</h3>
          <div className="discover-grid">
            {filteredItems.map(item => (
              <div key={item.id} className="discover-card">
                <div className="card-icon">{item.icon}</div>
                <div className="card-content">
                  <h4>{item.name}</h4>
                  <span className="card-category">{item.category}</span>
                  <p className="card-description">{item.description}</p>
                  <div className="card-stats">
                    <span className="user-count">👥 {item.users.toLocaleString()}</span>
                    <button className="explore-btn">Explore →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="discover-sidebar">
          <div className="sidebar-section">
            <h4>🔥 Trending</h4>
            <div className="trending-list">
              {TRENDING_TOPICS.map((topic, idx) => (
                <div key={idx} className="trending-item">
                  <span className="trending-tag">{topic.tag}</span>
                  <span className="trending-count">{topic.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h4>📊 Ecosystem Stats</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{totalUsers.toLocaleString()}</span>
                <span className="stat-label">Total Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{items.length}</span>
                <span className="stat-label">Protocols</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{avgEngagement.toLocaleString()}</span>
                <span className="stat-label">Avg Engagement</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{BASE_RATIO.toFixed(3)}</span>
                <span className="stat-label">φ Ratio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Discover;
