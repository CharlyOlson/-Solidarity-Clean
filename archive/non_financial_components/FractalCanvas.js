
/*
 * SOLIDARITY PLATFORM - FRACTAL CANVAS
 * =====================================
 * Barnsley fern IFS with harmonic amplitude visualization
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

import { PHI, SACRED_NODES, SAFETY_TIERS } from '../config/constants';
import { getOperationalStatus } from './OperationalStatus';

export function FractalCanvas() {
  const root = document.createElement('div');

  // Get operational status and safety tier
  const opStatus = getOperationalStatus ? getOperationalStatus() : { safetyLevel: 0.618, safetyTier: 'OPTIMAL_RANGE' };
  const safetyTier = SAFETY_TIERS.find(t => opStatus.safetyLevel >= t.min && opStatus.safetyLevel <= t.max) || SAFETY_TIERS[3];

  root.innerHTML = `
    <h2>📊 Fractal & Harmonic Diagnostics</h2>
    <div class="subtitle" style="margin-top: 0.5rem">→ Click "Draw Fractal" for Barnsley fern IFS → Toggle harmonics to see wave patterns</div>
    <canvas id="fractalCanvas" class="canvas" width="1200" height="360"></canvas>
    <div class="row" style="margin-top:8px">
      <button class="btn" id="drawBtn">Draw Fractal</button>
      <button class="btn secondary" id="animateBtn">Toggle Harmonics</button>
      <span class="subtitle">ℹ️ IFS visualization for diagnostic purposes only</span>
    </div>
    <div style="margin-top:8px; padding:10px; background:rgba(11,61,145,0.06); border-radius:6px">
      <div class="subtitle">
        <strong>Fractal Parameters:</strong><br/>
        • Barnsley fern IFS (Iterated Function System)<br/>
        • 4 affine transformations with φ-ratio probabilities<br/>
        • Harmonic amplitude: 8 + 6×sin(t/300) at 49 Hz baseline<br/>
        • Golden angle rotation: 137.508° per iteration<br/>
        • Sacred Nodes: ${SACRED_NODES.join(', ')}<br/>
        • Safety Tier: ${safetyTier.name} (${opStatus.safetyLevel})<br/>
      </div>
    </div>
    <div style="margin-top:8px; padding:8px; background:rgba(255,255,255,0.07); border-radius:6px">
      <strong>Help & Documentation:</strong><br/>
      <ul style="margin:0; padding-left:18px">
        <li>Uses φ-ratio (${PHI}) for transformation probabilities</li>
        <li>Safety tier logic matches backend configuration</li>
        <li>See <a href="/COMPLETE_SYSTEM_DOCUMENTATION.md" target="_blank">Complete System Documentation</a> for details</li>
      </ul>
    </div>
  `;
  
  const canvas = root.querySelector('#fractalCanvas');
  const ctx = canvas.getContext('2d');
  let animOn = false;
  let animId = null;

  function drawFractal(iter = 30000) {
    try {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#071a2b');
      gradient.addColorStop(1, '#020617');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw Barnsley fern
      let x = 0, y = 0;
      ctx.fillStyle = '#ffb703';
      for (let i = 0; i < iter; i++) {
        const r = Math.random();
        let x1, y1;
        // Barnsley fern transformations (φ-ratio probabilities)
        if (r < 0.01) {
          x1 = 0;
          y1 = 0.16 * y;
        } else if (r < 0.86) {
          x1 = 0.85 * x + 0.04 * y;
          y1 = -0.04 * x + 0.85 * y + 1.6;
        } else if (r < 0.93) {
          x1 = 0.2 * x - 0.26 * y;
          y1 = 0.23 * x + 0.22 * y + 1.6;
        } else {
          x1 = -0.15 * x + 0.28 * y;
          y1 = 0.26 * x + 0.24 * y + 0.44;
        }
        x = x1;
        y = y1;
        const px = canvas.width / 2 + x * 60;
        const py = canvas.height - y * 60;
        // Color based on y-coordinate (height)
        const hue = 40 + (y / 12) * 80;
        ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
        ctx.fillRect(px, py, 1, 1);
      }
    } catch (err) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff0000';
      ctx.font = '18px sans-serif';
      ctx.fillText('Error drawing fractal: ' + err.message, 40, 40);
    }
  }

  function animate(t = 0) {
    try {
      // Harmonic amplitude with φ-ratio
      const amp = 8 + 6 * Math.sin(t / 300);
      ctx.globalCompositeOperation = 'lighter';
      drawFractal(12000);
      // Draw harmonic wave
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i += 4) {
        const y = canvas.height / 2 + Math.sin((i + t / 6) / 40) * amp;
        if (i === 0) {
          ctx.moveTo(i, y);
        } else {
          ctx.lineTo(i, y);
        }
      }
      ctx.strokeStyle = '#0b3d91';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Add φ-ratio markers at sacred node positions
      for (let i = 0; i < SACRED_NODES.length; i++) {
        const x = (canvas.width / SACRED_NODES.length) * i;
        const y = canvas.height / 2 + Math.sin((x + t / 6) / 40) * amp;
        ctx.fillStyle = i % 2 === 0 ? '#ffb703' : '#4CAF50';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(animate);
    } catch (err) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff0000';
      ctx.font = '18px sans-serif';
      ctx.fillText('Error animating fractal: ' + err.message, 40, 40);
    }
  }

  root.querySelector('#drawBtn').addEventListener('click', () => {
    try {
      if (animOn) {
        animOn = false;
        cancelAnimationFrame(animId);
      }
      drawFractal(30000);
    } catch (err) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff0000';
      ctx.font = '18px sans-serif';
      ctx.fillText('Error: ' + err.message, 40, 40);
    }
  });

  root.querySelector('#animateBtn').addEventListener('click', () => {
    try {
      animOn = !animOn;
      if (animOn) {
        animate();
      } else {
        cancelAnimationFrame(animId);
        drawFractal(30000);
      }
    } catch (err) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ff0000';
      ctx.font = '18px sans-serif';
      ctx.fillText('Error: ' + err.message, 40, 40);
    }
  });

  // Initial draw
  drawFractal(20000);
  return root;
}
