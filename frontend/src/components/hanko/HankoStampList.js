import React from 'react';

const HankoStampList = ({ stamps, stampTypes, viewStampDetails }) => (
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
);

export default HankoStampList;
