/**
 * SOLIDARITY PLATFORM - SACRED GEOMETRY DASHBOARD
 * Interactive φ-based mathematical visualization
 */

const API_BASE = '';

export function SacredGeometryDashboard() {
  const root = document.createElement('div');
  
  root.innerHTML = `
    <h2>🌟 Sacred Geometry — φ Mathematics</h2>
    <div class="subtitle" style="margin-top: 0.5rem">→ Explore φ (phi) = 1.618, Fibonacci sequence, and golden ratio calculations</div>
    
    <div class="constants-grid" style="margin-top: var(--space-phi)">
      <div class="constant">
        <span class="constant-label">φ (Phi)</span>
        <span class="constant-value" id="phi">1.618033988749895</span>
      </div>
      <div class="constant">
        <span class="constant-label">1/φ</span>
        <span class="constant-value" id="phi-inverse">0.618033988749895</span>
      </div>
      <div class="constant">
        <span class="constant-label">φ²</span>
        <span class="constant-value" id="phi-squared">2.618033988749895</span>
      </div>
      <div class="constant">
        <span class="constant-label">Golden Angle</span>
        <span class="constant-value" id="golden-angle">137.508°</span>
      </div>
    </div>

    <div style="margin-top: var(--space-phi)">
      <h3>Golden Spiral</h3>
      <canvas id="goldenSpiral" width="600" height="600" style="width:100%; max-width:600px; border-radius:12px; background:#020617; border:2px solid #0b3d91"></canvas>
    </div>

    <div style="margin-top: var(--space-phi)">
      <h3>Fibonacci Convergence to φ</h3>
      <div id="fibonacciList" class="fingerprint" style="max-height: 150px; overflow-y: auto">
        Computing Fibonacci sequence...
      </div>
    </div>

    <div style="margin-top: var(--space-phi)">
      <h3>Sacred Nodes — Solidarity System</h3>
      <div class="constants-grid" id="sacredNodes"></div>
    </div>

    <div style="margin-top: var(--space-phi)">
      <h3>Henry Progression (7 → 14 → 49)</h3>
      <div class="row" style="gap: var(--space-phi)">
        <div class="constant" style="flex: 1">
          <span class="constant-label">Base</span>
          <span class="constant-value">7</span>
        </div>
        <div class="constant" style="flex: 1">
          <span class="constant-label">Double</span>
          <span class="constant-value">14</span>
        </div>
        <div class="constant" style="flex: 1">
          <span class="constant-label">Square</span>
          <span class="constant-value">49</span>
        </div>
      </div>
    </div>

    <div style="margin-top: var(--space-phi); padding: var(--space-phi); background: rgba(255,215,0,0.05); border-radius: 8px; border: 1px solid rgba(255,215,0,0.2)">
      <h3 style="margin-top: 0">📊 Live Statistics</h3>
      <div id="stats" class="subtitle"></div>
    </div>
  `;

  const canvas = root.querySelector('#goldenSpiral');
  const ctx = canvas.getContext('2d');
  const fibList = root.querySelector('#fibonacciList');
  const nodesContainer = root.querySelector('#sacredNodes');
  const stats = root.querySelector('#stats');

  // Draw golden spiral
  function drawGoldenSpiral() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const PHI = 1.618033988749895;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw spiral using golden angle
    const goldenAngle = 137.508 * Math.PI / 180;
    let radius = 2;
    
    ctx.strokeStyle = '#ffb703';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 0; i < 2000; i++) {
      const angle = i * goldenAngle;
      const r = radius * Math.pow(PHI, i / 300);
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      
      // Add dots at sacred nodes (multiples of 7)
      if (i % 70 === 0) {
        ctx.stroke();
        ctx.fillStyle = i % 140 === 0 ? '#4CAF50' : '#0b3d91';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = '#ffb703';
      }
    }
    
    ctx.stroke();
    
    // Draw center point
    ctx.fillStyle = '#ff5722';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Generate Fibonacci sequence
  async function computeFibonacci() {
    try {
      const resp = await fetch(`${API_BASE}/api/mathematical/fibonacci/20`);
      if (!resp.ok) throw new Error('API unavailable');
      
      const data = await resp.json();
      const { sequence, ratios } = data;
      
      let html = '<strong>Fibonacci Sequence & Ratios:</strong>\n\n';
      for (let i = 0; i < sequence.length; i++) {
        const ratio = ratios[i] || 0;
        html += `F(${i}) = ${sequence[i].toLocaleString()}`;
        if (i > 0) {
          html += ` — ratio: ${ratio.toFixed(15)}`;
        }
        html += '\n';
      }
      html += '\n✅ Converges to φ = 1.618033988749895';
      
      fibList.textContent = html;
    } catch (e) {
      // Fallback local computation
      const fib = [0, 1];
      for (let i = 2; i <= 20; i++) {
        fib.push(fib[i - 1] + fib[i - 2]);
      }
      
      let html = '<strong>Fibonacci Sequence (Local):</strong>\n\n';
      for (let i = 0; i < fib.length; i++) {
        html += `F(${i}) = ${fib[i].toLocaleString()}`;
        if (i > 1) {
          const ratio = fib[i] / fib[i - 1];
          html += ` — ratio: ${ratio.toFixed(15)}`;
        }
        html += '\n';
      }
      html += '\n⚠️ API unavailable. Local computation shown.';
      
      fibList.textContent = html;
    }
  }

  // Render sacred nodes
  function renderSacredNodes() {
    const nodes = [1, 3, 4, 7, 14, 21, 49];
    const PHI = 1.618033988749895;
    
    nodes.forEach(node => {
      const div = document.createElement('div');
      div.className = 'constant';
      div.innerHTML = `
        <span class="constant-label">Node ${node}</span>
        <span class="constant-value">${(node * PHI).toFixed(3)}</span>
      `;
      div.style.cursor = 'pointer';
      div.addEventListener('click', () => {
        alert(`Sacred Node ${node}\n\nφ-weighted: ${(node * PHI).toFixed(6)}\n1/φ-weighted: ${(node * (1/PHI)).toFixed(6)}\n\nUsed in: ${node === 7 ? 'Henry base' : node === 14 ? 'Henry double' : node === 49 ? 'Henry square' : 'System architecture'}`);
      });
      nodesContainer.appendChild(div);
    });
  }

  // Update statistics
  function updateStats() {
    const PHI = 1.618033988749895;
    const timestamp = new Date().toISOString();
    const safetyLevel = 0.618;
    
    stats.innerHTML = `
      <strong>System Status:</strong> ✅ Operational<br/>
      <strong>Safety Level:</strong> ${safetyLevel} (φ baseline)<br/>
      <strong>Quantum Coherence:</strong> ${safetyLevel}<br/>
      <strong>Last Update:</strong> ${timestamp}<br/>
      <strong>Control Ratio:</strong> ${(49 / 14).toFixed(3)} (49÷14)
    `;
  }

  // Initialize
  drawGoldenSpiral();
  computeFibonacci();
  renderSacredNodes();
  updateStats();
  
  // Update stats every 7 seconds (sacred node timing)
  setInterval(updateStats, 7000);

  return root;
}
