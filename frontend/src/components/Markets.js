/*
 * SOLIDARITY PLATFORM - MARKETS
 * ==============================
 * SVG line charts for crypto and traditional markets.
 * No external charting library — pure SVG paths.
 */

import React from 'react';
import './Markets.css';

const MARKET_DATA = [
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3285.42,
    change: 2.14,
    section: 'crypto',
    data: [2900, 2950, 3010, 2980, 3040, 3100, 3070, 3150, 3200, 3180, 3250, 3285],
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 68452.18,
    change: 1.37,
    section: 'crypto',
    data: [64000, 64800, 65200, 65900, 66100, 65800, 66500, 67200, 67800, 68000, 68300, 68452],
  },
  {
    id: 'sldrt',
    name: 'SLDRT',
    symbol: 'SLDRT',
    price: 1.0,
    change: 0.0,
    section: 'crypto',
    data: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
  },
  {
    id: 'sp500',
    name: 'S&P 500',
    symbol: 'SPX',
    price: 5248.63,
    change: 0.45,
    section: 'traditional',
    data: [5100, 5120, 5080, 5150, 5170, 5140, 5190, 5210, 5200, 5230, 5240, 5248],
  },
  {
    id: 'nasdaq',
    name: 'NASDAQ',
    symbol: 'IXIC',
    price: 16412.71,
    change: -0.32,
    section: 'traditional',
    data: [16500, 16480, 16550, 16520, 16490, 16460, 16430, 16450, 16420, 16400, 16410, 16412],
  },
];

function MiniChart({ data, positive }) {
  const width = 200;
  const height = 60;
  const padding = 4;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((val - min) / range) * (height - 2 * padding);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const fillD = `${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;
  const color = positive ? '#4CAF50' : '#C62828';
  const fillColor = positive ? 'rgba(76,175,80,0.1)' : 'rgba(198,40,40,0.1)';

  return (
    <svg className="mini-chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={fillD} fill={fillColor} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MarketCard({ item }) {
  const positive = item.change >= 0;
  const changeClass = positive ? 'market-change positive' : 'market-change negative';
  const changePrefix = positive ? '+' : '';

  return (
    <div className="market-card">
      <div className="market-card-header">
        <div>
          <h3 className="market-name">{item.name}</h3>
          <span className="market-symbol">{item.symbol}</span>
        </div>
        <div className="market-price-block">
          <span className="market-price">
            ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={changeClass}>
            {changePrefix}{item.change.toFixed(2)}%
          </span>
        </div>
      </div>
      <MiniChart data={item.data} positive={positive} />
    </div>
  );
}

function Markets() {
  const crypto = MARKET_DATA.filter((m) => m.section === 'crypto');
  const traditional = MARKET_DATA.filter((m) => m.section === 'traditional');

  return (
    <div className="markets-container">
      <div className="markets-section">
        <h2 className="markets-section-title">Crypto Markets</h2>
        <div className="markets-grid">
          {crypto.map((item) => (
            <MarketCard key={item.id} item={item} />
          ))}
        </div>
      </div>

      <div className="markets-section">
        <h2 className="markets-section-title">Traditional Markets</h2>
        <div className="markets-grid">
          {traditional.map((item) => (
            <MarketCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Markets;
