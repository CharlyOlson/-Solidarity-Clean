# 🚀 QUICK START — Lock Gate Frontend

## Start the System

\`\`\`powershell
# Option 1: Launch script (recommended)
.\\start-frontend.ps1

# Option 2: Direct npm
npm start
\`\`\`

**Access:** http://localhost:3000

---

## 5 Tabs Available

| Tab | Icon | Description | Key Feature |
|-----|------|-------------|-------------|
| **Lock Gate** | 🔒 | Omega Lock Gate UI | HMAC verification |
| **Diagnostics** | 📊 | Fractal canvas | Barnsley fern IFS |
| **Exchange** | 🔄 | Device A/B swap | φ-ratio conservation |
| **Sacred Geometry** | 🌟 | Golden spiral | Fibonacci convergence |
| **Harmonic Phrases** | 🎵 | Phrase processor | "Silly names" solver |

---

## API Endpoints (Quick Reference)

### Lock Gate
\`\`\`
POST /api/lockgate/nonce       Request nonce
POST /api/lockgate/prepare     Verify payload
GET  /api/lockgate/audit       View logs
\`\`\`

### Devices
\`\`\`
GET  /devices                  List devices
POST /devices/swap             Swap A↔B
POST /devices/balance          Force balance
\`\`\`

### Mathematical
\`\`\`
GET  /api/mathematical/golden-ratio
POST /api/mathematical/harmonic-phrase
POST /api/mathematical/correct-text
\`\`\`

---

## Test Workflow

### 1. Lock Gate (30 seconds)
1. Click **🔒 Lock Gate**
2. Enter user ID, action, notes
3. Click **Send to Backend**
4. View verification result

### 2. Device Swap (10 seconds)
1. Click **🔄 Exchange**
2. Click **🔄 Unified Swap**
3. Watch values swap (φ ↔ 1/φ)

### 3. Fractal (15 seconds)
1. Click **📊 Diagnostics**
2. Click **Toggle Harmonics**
3. Watch animated fern

---

## Key Values

\`\`\`
φ (Phi)              = 1.618033988749895
1/φ                  = 0.618033988749895
Golden Angle         = 137.508°
Safety Baseline      = 0.618
Control Ratio (49÷14) = 3.5
\`\`\`

---

## Sacred Nodes

\`\`\`
1, 3, 4, 7, 14, 21, 49
      ↓  ↓   ↓
   Base→Double→Square
   (Henry Progression)
\`\`\`

---

## Coil Currency

\`\`\`
1 penny  = 100,000 coils
1 dollar = 10,000,000 coils
\`\`\`

---

## Health Check

\`\`\`powershell
curl http://localhost:3000/api/health
\`\`\`

---

## File Structure (Essentials)

\`\`\`
frontend/
  public/index.html          Entry point
  src/
    app.js                   Orchestrator
    components/
      LockGateUI.js          🔒
      FractalCanvas.js       📊
      SwapComponent.js       🔄
    styles/main.css          φ-based design

src/api/routes/
  lockgate.js                Lock Gate API
  devices.js                 Device API
\`\`\`

---

## Documentation

- **[LOCK_GATE_COMPLETE.md](./LOCK_GATE_COMPLETE.md)** — Complete summary
- **[FRONTEND_INTEGRATION_GUIDE.md](./FRONTEND_INTEGRATION_GUIDE.md)** — Full guide
- **[COMPLETE_SYSTEM_DOCUMENTATION.md](./COMPLETE_SYSTEM_DOCUMENTATION.md)** — System docs

---

## Troubleshooting

**Blank page?**
→ Check `frontend/public/index.html` exists

**API 404?**
→ Restart server: `npm start`

**CORS errors?**
→ Verify `app.use(cors())` in server.js

**Module errors?**
→ Check `<script type="module">` in index.html

---

**🎉 System Ready — Access http://localhost:3000**
