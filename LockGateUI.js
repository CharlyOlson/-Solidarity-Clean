/**
 * SOLIDARITY PLATFORM - LOCK GATE UI
 * Omega Lock Gate with SHA-256 client preview and HMAC verification
 */

import { sha256Hex } from '../utils/crypto.js';
import { BASE_RATIO, BRIDGING_BASELINE } from '../config/constants';

export function LockGateUI() {
  const root = document.createElement('div');

  root.innerHTML = `
    <h2>🔒 Omega Lock Gate</h2>
    <div class="subtitle" style="margin-top: 0.5rem">→ Fill in User ID and Action → Click "Prepare Lock Gate" → Send to backend for verification</div>
    <div class="code-border" style="margin-top: var(--space-phi)">
      <p class="subtitle">ℹ️ Client-side SHA-256 is a preview only — backend HMAC verification is authoritative</p>
      <div class="row">
        <button class="btn" id="prepareBtn">Prepare Lock Gate</button>
        <button class="btn secondary" id="nonceBtn">Request Nonce</button>
      </div>
    </div>

    <div style="margin-top:14px" class="controls">
      <label class="subtitle">User ID</label>
      <input class="input" id="userId" placeholder="scott.charles" value="scott.charles" />
      
      <label class="subtitle">Action</label>
      <input class="input" id="action" placeholder="deploy:treasury" value="deploy:treasury" />
      
      <label class="subtitle">Notes</label>
      <textarea class="textarea" id="notes" rows="4" placeholder="Purpose, scope, references...">Testing Omega Lock Gate with φ-ratio security baseline 0.618</textarea>

      <div style="margin-top:8px">
        <div class="subtitle">Client-side SHA-256 preview (UX only)</div>
        <div id="fingerprint" class="fingerprint">—</div>
      </div>

      <div class="row" style="margin-top:8px">
        <button class="btn secondary" id="copyPayload">Copy Payload</button>
        <button class="btn" id="sendBtn">Send to Backend</button>
      </div>

      <pre id="result" class="fingerprint" style="margin-top:10px; max-height: 200px; overflow-y: auto;">Response will appear here...</pre>
    </div>

    <div style="margin-top:14px; padding:12px; background:rgba(76,175,80,0.1); border-radius:8px; border:1px solid rgba(76,175,80,0.3)">
      <h3 style="margin:0 0 8px 0; color:#4CAF50">🔐 Security Notes</h3>
      <ul style="margin:0; padding-left:20px; font-size:0.9rem; color:var(--muted)">
        <li>Client hash is SHA-256 preview for UX only</li>
        <li>Backend performs canonical serialization</li>
        <li>HMAC verification with server key required</li>
        <li>Audit trail with φ-ratio safety level tracking</li>
        <li>Coil currency integration: 1 USD = 10,000,000 Coils</li>
      </ul>
    </div>
  `;

  const userIdEl = root.querySelector('#userId');
  const actionEl = root.querySelector('#action');
  const notesEl = root.querySelector('#notes');
  const fingerprintEl = root.querySelector('#fingerprint');
  const resultEl = root.querySelector('#result');

  async function buildPayload() {
    const userId = userIdEl.value || '';
    const action = actionEl.value || '';
    const notes = notesEl.value || '';
    const timestamp = new Date().toISOString();
    
    const payload = JSON.stringify({ 
      userId, 
      action, 
      notes, 
      timestamp,
      safetyLevel: BRIDGING_BASELINE,  // φ-ratio baseline
      phi: BASE_RATIO
    }, null, 2);
    
    const hex = await sha256Hex(payload);
    fingerprintEl.textContent = `${hex.slice(0, 32)}...\nFull: ${hex}`;
    return { payload, hex };
  }

  userIdEl.addEventListener('input', buildPayload);
  actionEl.addEventListener('input', buildPayload);
  notesEl.addEventListener('input', buildPayload);

  root.querySelector('#prepareBtn').addEventListener('click', async () => {
    const { hex } = await buildPayload();
    alert('🔒 Prepared payload (client preview):\n' + hex.slice(0, 32) + '...\n\nSend to backend for authoritative verification.');
  });

  root.querySelector('#copyPayload').addEventListener('click', async () => {
    const { payload } = await buildPayload();
    await navigator.clipboard.writeText(payload);
    resultEl.textContent = '✅ Payload copied to clipboard (client preview).';
  });

  root.querySelector('#nonceBtn').addEventListener('click', async () => {
    try {
      const userId = userIdEl.value || '';
      resultEl.textContent = '⏳ Requesting nonce...';
      
      const resp = await fetch('/api/lockgate/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      const data = await resp.json();
      resultEl.textContent = JSON.stringify(data, null, 2);
    } catch (e) {
      resultEl.textContent = '❌ Nonce error: ' + e.message + '\n\nNote: Backend may not be running.';
    }
  });

  root.querySelector('#sendBtn').addEventListener('click', async () => {
    try {
      const { payload, hex } = await buildPayload();
      resultEl.textContent = '⏳ Sending to backend...';
      
      const resp = await fetch('/api/lockgate/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payload, 
          clientHash: hex,
          safetyLevel: BRIDGING_BASELINE
        })
      });
      
      const data = await resp.json();
      resultEl.textContent = JSON.stringify(data, null, 2);
      
      // Update stats
      if (data.success) {
        const stats = JSON.parse(localStorage.getItem('solidarityStats') || '{}');
        stats.lockGate = (stats.lockGate || 0) + 1;
        localStorage.setItem('solidarityStats', JSON.stringify(stats));
        
        // Add activity
        const activities = JSON.parse(localStorage.getItem('solidarityActivity') || '[]');
        activities.unshift({
          timestamp: new Date().toISOString(),
          description: `Lock Gate verification: ${data.verification}`
        });
        localStorage.setItem('solidarityActivity', JSON.stringify(activities));
      }
    } catch (e) {
      resultEl.textContent = '❌ Network error: ' + e.message + '\n\nNote: Backend may not be running. Start with:\nnpm start\n\nOr test lock gate functionality offline.';
    }
  });

  // Initial fingerprint
  buildPayload();
  return root;
}
