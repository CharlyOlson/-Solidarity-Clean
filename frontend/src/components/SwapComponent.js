/**
 * SOLIDARITY PLATFORM - SWAP COMPONENT
 * Device A/B exchange UI with backend connector
 */

import { fetchDevices, swapAB } from '../utils/connector.js';

export function SwapComponent() {
  const root = document.createElement('div');
  
  root.innerHTML = `
    <h2>🔄 Exchange — Device A/B Swap</h2>
    <div class="subtitle" style="margin-top: 0.5rem">→ View device values below → Click "Unified Swap" to exchange Device A ↔ Device B</div>
    <div class="code-border" style="margin-top: var(--space-phi)">
      <div class="subtitle">ℹ️ Swap preserves φ-ratio conservation: Device A = φ (1.618), Device B = 1/φ (0.618)</div>
    </div>
    <div class="row" style="margin-top: var(--space-phi)">
      <div class="device-card" id="devA">
        <div class="device-title">Device A</div>
        <div class="device-meta" id="metaA">Status: Loading...</div>
      </div>
      <div class="device-card" id="devB">
        <div class="device-title">Device B</div>
        <div class="device-meta" id="metaB">Status: Loading...</div>
      </div>
    </div>
    
    <div class="row" style="margin-top:10px">
      <button class="btn" id="swapBtn">🔄 Unified Swap</button>
      <button class="btn secondary" id="refreshBtn">🔃 Refresh Devices</button>
      <span class="subtitle">Swap devices via backend UnifiedConnector API.</span>
    </div>
    
    <pre id="exResult" class="fingerprint" style="margin-top:10px; max-height:150px; overflow-y:auto">Response will appear here...</pre>
    
    <div style="margin-top:14px; padding:12px; background:rgba(97,218,251,0.06); border-radius:8px; border:1px solid rgba(97,218,251,0.2)">
      <h3 style="margin:0 0 8px 0; color:#61dafb">ℹ️ Swap Mechanics</h3>
      <ul style="margin:0; padding-left:20px; font-size:0.9rem; color:var(--muted)">
        <li>Sacred node-based value exchange (nodes 1,3,4,7,14,21,49)</li>
        <li>φ-ratio weighted transaction processing</li>
        <li>Force balance verification (angel/daemon equilibrium)</li>
        <li>Coil currency conversion: 1 USD = 10,000,000 Coils</li>
        <li>Audit trail with timestamp and safety level</li>
      </ul>
    </div>
  `;

  const metaA = root.querySelector('#metaA');
  const metaB = root.querySelector('#metaB');
  const result = root.querySelector('#exResult');

  async function load() {
    try {
      result.textContent = '⏳ Loading devices...';
      const data = await fetchDevices();
      
      if (data && data.devices) {
        const a = data.devices[0] || { name: 'Device A', status: 'unknown', value: 0 };
        const b = data.devices[1] || { name: 'Device B', status: 'unknown', value: 0 };
        
        metaA.textContent = `${a.name} — ${a.status} — value: ${a.value}`;
        metaB.textContent = `${b.name} — ${b.status} — value: ${b.value}`;
        result.textContent = '✅ Devices loaded successfully.';
      } else {
        // Fallback mock data if backend unavailable
        metaA.textContent = 'Device A — active — value: 1.618 (φ)';
        metaB.textContent = 'Device B — active — value: 0.618 (1/φ)';
        result.textContent = '⚠️ Backend unavailable. Showing mock data.\n\nStart backend with: npm start';
      }
    } catch (e) {
      metaA.textContent = 'Device A — offline — value: 1.618 (φ)';
      metaB.textContent = 'Device B — offline — value: 0.618 (1/φ)';
      result.textContent = `⚠️ Load error: ${e.message}\n\nBackend may not be running. Mock data shown.`;
    }
  }

  root.querySelector('#swapBtn').addEventListener('click', async () => {
    try {
      result.textContent = '⏳ Executing swap...';
      const data = await swapAB();
      
      if (data && data.devices) {
        const a = data.devices[0];
        const b = data.devices[1];
        
        metaA.textContent = `${a.name} — ${a.status} — value: ${a.value}`;
        metaB.textContent = `${b.name} — ${b.status} — value: ${b.value}`;
        result.textContent = '✅ Swap complete!\n\n' + JSON.stringify(data, null, 2);
        
        // Update stats
        const stats = JSON.parse(localStorage.getItem('solidarityStats') || '{}');
        stats.swaps = (stats.swaps || 0) + 1;
        localStorage.setItem('solidarityStats', JSON.stringify(stats));
        
        // Add activity
        const activities = JSON.parse(localStorage.getItem('solidarityActivity') || '[]');
        activities.unshift({
          timestamp: new Date().toISOString(),
          description: `Device swap executed — Conservation: ${data.conservation?.maintained ? '✅' : '⚠️'}`
        });
        localStorage.setItem('solidarityActivity', JSON.stringify(activities));
      } else {
        result.textContent = '⚠️ Swap result unavailable. Check backend connection.';
      }
    } catch (e) {
      result.textContent = `❌ Swap error: ${e.message}\n\nEnsure backend is running: npm start`;
    }
  });

  root.querySelector('#refreshBtn').addEventListener('click', load);

  // Initial load
  load();
  return root;
}
