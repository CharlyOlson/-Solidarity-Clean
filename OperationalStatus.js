import React, { useEffect, useState } from 'react';
import { BASE_RATIO, BRIDGING_BASELINE, SACRED_NODES } from '../config/constants';
import { getApiUrl } from '../config/api';

// OperationalStatus component: displays backend operational status, safety, and quantum/AI info
const OperationalStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(getApiUrl('/api/router/operational-status'));
        if (!res.ok) throw new Error('Failed to fetch status');
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading operational status...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;
  if (!status) return <div>No status available.</div>;

  return (
    <div className="operational-status-panel" style={{border:'1px solid #ccc',borderRadius:8,padding:16,margin:16,background:'#f9f9f9'}}>
      <h3>System Operational Status</h3>
      <div><b>Shared Operational %:</b> {status.sharedOperationalPercent}%</div>
      <div><b>Global Safety Level:</b> {status.globalSafetyLevel}</div>
      <div><b>Base Ratio (φ):</b> {BASE_RATIO}</div>
      <div><b>Bridging Baseline:</b> {BRIDGING_BASELINE}</div>
      <div><b>Sacred Nodes:</b> {SACRED_NODES.join(', ')}</div>
      <div><b>Subsystems:</b></div>
      <ul>
        {Object.entries(status.componentSafety).map(([k,v]) => (
          <li key={k}>{k}: {v}</li>
        ))}
      </ul>
      <div><b>Quantum Engine:</b> {status.subsystems.quantum ? 'ENABLED' : 'DISABLED'}</div>
      <div><b>AI Integration:</b> {status.subsystems.ai ? 'ENABLED' : 'DISABLED'}</div>
      <div><b>Financial:</b> {status.subsystems.financial ? 'ENABLED' : 'DISABLED'}</div>
      <div><b>Bridging Anchor:</b> {status.subsystems.bridgingAnchor ? 'ENABLED' : 'DISABLED'}</div>
      <div style={{marginTop:8}}><i>Last updated: {status.timestamp}</i></div>
    </div>
  );
};

export default OperationalStatus;
