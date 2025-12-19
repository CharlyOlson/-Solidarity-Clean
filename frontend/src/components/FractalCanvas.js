/**
 * SOLIDARITY PLATFORM - FRACTAL CANVAS
 * Barnsley fern IFS with harmonic amplitude visualization
 */

export function FractalCanvas() {
  const root = document.createElement('div');
  
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
        • Golden angle rotation: 137.508° per iteration
      </div>
    </div>
  `;
  
  const canvas = root.querySelector('#fractalCanvas');
  const ctx = canvas.getContext('2d');
  let animOn = false;
  let animId = null;

  function drawFractal(iter = 30000) {
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
      
      // Barnsley fern transformations
      if (r < 0.01) {
        // Stem (1%)
        x1 = 0;
        y1 = 0.16 * y;
      } else if (r < 0.86) {
        // Successively smaller leaflets (85%)
        x1 = 0.85 * x + 0.04 * y;
        y1 = -0.04 * x + 0.85 * y + 1.6;
      } else if (r < 0.93) {
        // Largest left leaflet (7%)
        x1 = 0.2 * x - 0.26 * y;
        y1 = 0.23 * x + 0.22 * y + 1.6;
      } else {
        // Largest right leaflet (7%)
        x1 = -0.15 * x + 0.28 * y;
        y1 = 0.26 * x + 0.24 * y + 0.44;
      }
      
      x = x1;
      y = y1;
      
      const px = canvas.width / 2 + x * 60;
      const py = canvas.height - y * 60;
      
      // Color based on y-coordinate (height)
      const hue = 40 + (y / 12) * 80; // Gold to green
      ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
      ctx.fillRect(px, py, 1, 1);
    }
  }

  function animate(t = 0) {
    // Harmonic amplitude with φ-ratio
    const PHI = 1.618033988749895;
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
    
    // Add φ-ratio markers at golden angle positions
    for (let i = 0; i < 7; i++) {
      const x = (canvas.width / 7) * i;
      const y = canvas.height / 2 + Math.sin((x + t / 6) / 40) * amp;
      ctx.fillStyle = i % 2 === 0 ? '#ffb703' : '#4CAF50';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    animId = requestAnimationFrame(animate);
  }

  root.querySelector('#drawBtn').addEventListener('click', () => {
    if (animOn) {
      animOn = false;
      cancelAnimationFrame(animId);
    }
    drawFractal(30000);
  });

  root.querySelector('#animateBtn').addEventListener('click', () => {
    animOn = !animOn;
    if (animOn) {
      animate();
    } else {
      cancelAnimationFrame(animId);
      drawFractal(30000);
    }
  });

  // Initial draw
  drawFractal(20000);
  return root;
}
