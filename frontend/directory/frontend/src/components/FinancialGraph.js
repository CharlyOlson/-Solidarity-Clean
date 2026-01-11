import React, { useEffect, useState } from 'react';

function FinancialGraph() {
  const [data, setData] = useState([]);
  const [harmonics, setHarmonics] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch financial data
      const res = await fetch('/api/financial/data');
      const json = await res.json();
      setData(json.data);
      // Fetch model results
      const modelRes = await fetch('/api/financial/model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: json.data })
      });
      const modelJson = await modelRes.json();
      setHarmonics(modelJson.harmonics);
      setPredictions(modelJson.predictions);
      setHighlights(modelJson.highlights);
      setLoading(false);
    }
    fetchData();
  }, []);

  // SVG graph dimensions
  const width = 600;
  const height = 300;
  const margin = 40;

  // Helper: scale data to SVG
  const scaleX = i => margin + (i / (data.length - 1)) * (width - 2 * margin);
  const scaleY = v => height - margin - v * (height - 2 * margin);

  // Tooltip rendering
  const renderTooltip = () => {
    if (!hover) return null;
    const { x, y, value, label } = hover;
    return (
      <div className="graph-tooltip" style={{ position: 'absolute', left: x + 20, top: y - 10, background: '#fff', border: '1px solid #4fd1c5', borderRadius: 6, padding: '6px 12px', boxShadow: '0 2px 8px #0002', pointerEvents: 'none', zIndex: 10 }}>
        <strong>{label}</strong>: {value.toFixed(3)}
      </div>
    );
  };

  return (
    <div className="financial-graph" style={{ position: 'relative' }}>
      <h2>Financial Harmonics & Predictions</h2>
      {loading ? <div>Loading...</div> : (
        <svg width={width} height={height} style={{ background: '#f8faff', borderRadius: 12, boxShadow: '0 2px 8px #0002', transition: 'box-shadow 0.3s' }}>
          {/* Harmonics line */}
          <polyline
            points={harmonics.map((pt, i) => `${scaleX(i)},${scaleY(pt.value)}`).join(' ')}
            fill="none"
            stroke="#4fd1c5"
            strokeWidth={2.5}
            style={{ filter: 'drop-shadow(0 0 6px #4fd1c5aa)', transition: 'stroke 0.2s' }}
          />
          {/* Predictions line */}
          <polyline
            points={predictions.map((pt, i) => `${scaleX(i)},${scaleY(pt.value)}`).join(' ')}
            fill="none"
            stroke="#7f5af0"
            strokeWidth={2}
            style={{ filter: 'drop-shadow(0 0 4px #7f5af088)', opacity: 0.8, transition: 'stroke 0.2s' }}
          />
          {/* Actual data line */}
          <polyline
            points={data.map((pt, i) => `${scaleX(i)},${scaleY(pt.value)}`).join(' ')}
            fill="none"
            stroke="#2cb67d"
            strokeWidth={1.5}
            style={{ opacity: 0.7, transition: 'stroke 0.2s' }}
          />
          {/* Highlights */}
          {highlights.map(h => (
            <circle
              key={h.index}
              cx={scaleX(h.index)}
              cy={scaleY(h.value)}
              r={hover && hover.index === h.index ? 10 : 7}
              fill="#fbbf24"
              stroke="#222"
              strokeWidth={2}
              style={{ filter: 'drop-shadow(0 0 8px #fbbf24cc)', cursor: 'pointer', transition: 'r 0.2s' }}
              onMouseEnter={e => setHover({ x: scaleX(h.index), y: scaleY(h.value), value: h.value, label: 'Highlight', index: h.index })}
              onMouseLeave={() => setHover(null)}
            >
              <title>Key Event: {h.value.toFixed(3)}</title>
            </circle>
          ))}
          {/* Axes */}
          <line x1={margin} y1={height - margin} x2={width - margin} y2={height - margin} stroke="#222" strokeWidth={1.2} />
          <line x1={margin} y1={margin} x2={margin} y2={height - margin} stroke="#222" strokeWidth={1.2} />
        </svg>
      )}
      {renderTooltip()}
      <div className="legend" style={{ marginTop: 12 }}>
        <span style={{ color: '#4fd1c5' }}>■ Harmonics</span>
        <span style={{ color: '#7f5af0', marginLeft: 16 }}>■ Predictions</span>
        <span style={{ color: '#2cb67d', marginLeft: 16 }}>■ Actual</span>
        <span style={{ color: '#fbbf24', marginLeft: 16 }}>● Highlights</span>
      </div>
    </div>
  );
}

export default FinancialGraph;
