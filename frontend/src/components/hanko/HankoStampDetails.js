import React from 'react';

import { sanitizeHTML } from '../../utils/sanitize';

const HankoStampDetails = ({ selectedStamp, stampTypes, revokeStamp, onClose }) => (
  <div className="stamp-details-overlay">
    <div className="stamp-details-modal">
      <button 
        className="close-details"
        onClick={onClose}
      >
        ✕
      </button>
      <div className="stamp-details-header">
        {/* Display SVG stamp */}
        {selectedStamp.svg && (
          <div 
            className="details-svg-large"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(selectedStamp.svg) }}
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
);

export default HankoStampDetails;
