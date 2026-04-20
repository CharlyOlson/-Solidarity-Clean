/*
 * SOLIDARITY PLATFORM - MARKETS
 * ==============================
 * SVG line charts with selectable tickers and predictive overlay.
 * No external charting library — pure SVG paths.
 */

import React, { useState, useEffect, useCallback } from 'react';
import './Markets.css';

/* ============================================================
   SAMPLE DATA GENERATION
   ~90 points per ticker with characteristic volatility profiles
   ============================================================ */

function generateData(start, points, volatility, trend) {
  const data = [start];
  for (let i = 1; i < points; i++) {
    const noise = (Math.random() - 0.5) * 2 * volatility;
    const trendStep = trend * (1 + (Math.random() - 0.5) * 0.5);
    const next = data[i - 1] + noise + trendStep;
    data.push(Math.max(next, start * 0.5));
  }
  return data;
}

// Seeded with deterministic-looking data per ticker
const TICKER_CONFIGS = {
  ETH:    { name: 'Ethereum',  start: 2900, vol: 85,   trend: 4.2,  section: 'crypto' },
  BTC:    { name: 'Bitcoin',   start: 64000, vol: 1200, trend: 50,   section: 'crypto' },
  SLDRT:  { name: 'SLDRT',    start: 1.00, vol: 0.008, trend: 0.001, section: 'crypto' },
  SOL:    { name: 'Solana',    start: 125,  vol: 8,    trend: 0.6,  section: 'crypto' },
  MATIC:  { name: 'Polygon',   start: 0.85, vol: 0.04, trend: -0.001, section: 'crypto' },
  'S&P 500':  { name: 'S&P 500',  start: 5100, vol: 30, trend: 1.6,  section: 'traditional' },
  NASDAQ: { name: 'NASDAQ',    start: 16200, vol: 80, trend: 2.3,  section: 'traditional' },
  DOW:    { name: 'Dow Jones', start: 38500, vol: 180, trend: 4.5,  section: 'traditional' },
  AAPL:   { name: 'Apple',     start: 172,  vol: 3.5,  trend: 0.2,  section: 'traditional' },
  MSFT:   { name: 'Microsoft', start: 415,  vol: 6,    trend: 0.4,  section: 'traditional' },
  GOLD:   { name: 'Gold',      start: 2350, vol: 12,   trend: 1.0,  section: 'commodity' },
  SILVER: { name: 'Silver',    start: 28.5, vol: 0.5,  trend: 0.03, section: 'commodity' },
};

const ALL_TICKERS = Object.keys(TICKER_CONFIGS);
const DEFAULT_TICKERS = ['ETH', 'BTC', 'SLDRT', 'S&P 500'];
const STORAGE_KEY = 'solidarity_selected_tickers';

// Generate data once at module level
const TICKER_DATA = {};
ALL_TICKERS.forEach((ticker) => {
  const cfg = TICKER_CONFIGS[ticker];
  TICKER_DATA[ticker] = generateData(cfg.start, 90, cfg.vol, cfg.trend);
});

/* ============================================================
   PREDICTIVE OVERLAY ALGORITHM
   ============================================================ */

const PHI = 1.618033988749895;

function generatePrediction(prices) {
  const recent = prices.slice(-20);
  const deltas = recent.map((p, i, arr) => (i > 0 ? p - arr[i - 1] : 0)).slice(1);
  const predictions = [];
  let lastPrice = prices[prices.length - 1];
  let lastDelta = deltas[deltas.length - 1];
  const workingDeltas = deltas.slice();

  for (let i = 0; i < 10; i++) {
    const recentDeltas = workingDeltas.slice(-5);
    const ratios = recentDeltas.map((d, j, arr) =>
      j > 0 && arr[j - 1] !== 0 ? Math.abs(d / arr[j - 1]) : 1
    );
    const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const phiDistance = Math.abs(avgRatio - PHI) / PHI;
    const direction = phiDistance < 0.3 ? 1 : -0.5;
    const dampening = 1 / (1 + i * 0.15);
    const nextDelta = lastDelta * direction * dampening;
    lastPrice = lastPrice + nextDelta;
    predictions.push(lastPrice);
    workingDeltas.push(nextDelta);
    lastDelta = nextDelta;
  }
  return predictions;
}

/* ============================================================
   CHART COMPONENT — SVG with prediction overlay
   ============================================================ */

function MarketChart({ data, predictions }) {
  const width = 500;
  const height = 120;
  const pad = 8;
  const allValues = data.concat(predictions);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;
  const totalLen = data.length + predictions.length;

  const toX = (i) => pad + (i / (totalLen - 1)) * (width - 2 * pad);
  const toY = (v) => height - pad - ((v - min) / range) * (height - 2 * pad);

  // Main price line
  const mainPoints = data.map((v, i) => `${toX(i)},${toY(v)}`);
  const mainPath = `M ${mainPoints.join(' L ')}`;

  // Fill under main line
  const mainFill = `${mainPath} L ${toX(data.length - 1)},${height - pad} L ${toX(0)},${height - pad} Z`;

  // Prediction line (starts from last data point)
  const predPoints = [
    `${toX(data.length - 1)},${toY(data[data.length - 1])}`,
    ...predictions.map((v, i) => `${toX(data.length + i)},${toY(v)}`),
  ];
  const predPath = `M ${predPoints.join(' L ')}`;

  // Prediction zone background
  const predZoneX = toX(data.length - 1);
  const predZoneW = toX(totalLen - 1) - predZoneX;

  return (
    <svg className="market-chart-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      {/* Prediction zone background */}
      <rect
        x={predZoneX}
        y={pad}
        width={predZoneW}
        height={height - 2 * pad}
        fill="rgba(212,175,55,0.05)"
      />
      {/* Main fill */}
      <path d={mainFill} fill="rgba(212,175,55,0.1)" />
      {/* Main price line */}
      <path d={mainPath} fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Prediction line */}
      <path
        d={predPath}
        fill="none"
        stroke="#E8D48B"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6,4"
        opacity="0.6"
      />
    </svg>
  );
}

/* ============================================================
   MARKET CARD COMPONENT
   ============================================================ */

function MarketCard({ ticker }) {
  const cfg = TICKER_CONFIGS[ticker];
  const data = TICKER_DATA[ticker];
  const predictions = generatePrediction(data);
  const currentPrice = data[data.length - 1];
  const prevPrice = data[data.length - 2];
  const change = ((currentPrice - prevPrice) / prevPrice) * 100;
  const positive = change >= 0;
  const changeClass = positive ? 'market-change positive' : 'market-change negative';
  const changePrefix = positive ? '+' : '';

  // Format price based on magnitude
  const formatPrice = (p) => {
    if (p >= 1000) return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (p >= 1) return p.toFixed(2);
    return p.toFixed(4);
  };

  return (
    <div className="market-card">
      <div className="market-card-header">
        <div>
          <h3 className="market-name">{cfg.name}</h3>
          <span className="market-symbol">{ticker}</span>
        </div>
        <div className="market-price-block">
          <span className="market-price">${formatPrice(currentPrice)}</span>
          <span className={changeClass}>{changePrefix}{change.toFixed(2)}%</span>
        </div>
      </div>
      <MarketChart data={data} predictions={predictions} />
      <div className="market-chart-legend">
        <span className="legend-item legend-price">
          <span className="legend-line legend-solid" />
          Price
        </span>
        <span className="legend-item legend-pred">
          <span className="legend-line legend-dashed" />
          Predictive Overlay
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN MARKETS COMPONENT
   ============================================================ */

function Markets() {
  const [selected, setSelected] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_TICKERS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
  }, [selected]);

  const toggleTicker = useCallback((ticker) => {
    setSelected((prev) => {
      if (prev.includes(ticker)) {
        return prev.filter((t) => t !== ticker);
      }
      return [...prev, ticker];
    });
  }, []);

  return (
    <div className="markets-container">
      <div className="ticker-selector">
        <h2 className="markets-section-title">Select Markets</h2>
        <div className="ticker-grid">
          {ALL_TICKERS.map((ticker) => (
            <button
              key={ticker}
              className={`ticker-btn ${selected.includes(ticker) ? 'ticker-active' : ''}`}
              onClick={() => toggleTicker(ticker)}
            >
              {ticker}
            </button>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="markets-section">
          <h2 className="markets-section-title">Market Overview</h2>
          <div className="markets-grid">
            {selected.map((ticker) => (
              <MarketCard key={ticker} ticker={ticker} />
            ))}
          </div>
        </div>
      )}

      {selected.length === 0 && (
        <p className="markets-empty">Select at least one market above to view charts.</p>
      )}
    </div>
  );
}

export default Markets;
