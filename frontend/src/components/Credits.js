/*
 * SOLIDARITY PLATFORM - CREDITS
 * ==============================
 * Platform attribution and trademark information.
 */

import React from 'react';
import './Credits.css';

function Credits() {
  return (
    <div className="credits-container">
      <div className="credits-card">
        <div className="credits-brand">SOLIDARITY PLATFORM</div>

        <div className="credits-section">
          <div className="credits-label">Founded by</div>
          <div className="credits-names">Scott Olson &amp; C.H. Dykes</div>
        </div>

        <div className="credits-section">
          <div className="credits-label">Built with</div>
          <div className="credits-tool">Perplexity AI</div>
        </div>

        <div className="credits-divider" />

        <div className="credits-trademark">
          &copy; 2026 Solidarity Platform<br />
          Trademarked by Scott Charles Olson
        </div>
      </div>
    </div>
  );
}

export default Credits;
