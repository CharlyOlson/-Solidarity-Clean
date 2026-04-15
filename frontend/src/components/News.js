/*
 * SOLIDARITY PLATFORM - NEWS / UPDATES
 * =====================================
 * Placeholder news feed with platform launch updates.
 */

import React from 'react';
import './News.css';

const NEWS_ITEMS = [
  {
    id: 1,
    title: 'Solidarity Platform Launch',
    description:
      'The Solidarity Platform is now live in early-access mode. Treasury management, coherence-gated AI, and wallet connectivity are available for registered users.',
    date: 'April 2026',
    tag: 'Launch',
  },
  {
    id: 2,
    title: 'GENIUS Act Stablecoin Timeline',
    description:
      'The GENIUS Act establishes a federal framework for payment stablecoins. SLDRT is designed to comply with reserve and audit requirements as the legislation progresses.',
    date: 'March 2026',
    tag: 'Regulation',
  },
  {
    id: 3,
    title: 'Hanko Verification System',
    description:
      'Digital Hanko stamps provide identity verification through a sudoku convergence algorithm. Each stamp encodes seven personal markers into a unique visual seal.',
    date: 'February 2026',
    tag: 'Feature',
  },
  {
    id: 4,
    title: 'AI Integration Update',
    description:
      'The coherence-gated AI assistant is connected to live market data and on-chain treasury state. Safety levels are determined by the golden ratio threshold system.',
    date: 'January 2026',
    tag: 'AI',
  },
];

function News() {
  return (
    <div className="news-container">
      <div className="news-header">
        <h2>Latest Updates</h2>
        <p className="news-subtitle">Platform news and development progress</p>
      </div>
      <div className="news-grid">
        {NEWS_ITEMS.map((item) => (
          <div key={item.id} className="news-card">
            <div className="news-card-top">
              <span className="news-tag">{item.tag}</span>
              <span className="news-date">{item.date}</span>
            </div>
            <h3 className="news-card-title">{item.title}</h3>
            <p className="news-card-desc">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default News;
