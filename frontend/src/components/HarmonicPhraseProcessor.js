/**
 * SOLIDARITY PLATFORM - HARMONIC PHRASE PROCESSOR
 * Process "silly names" into mathematical solutions
 */

const API_BASE = '';

export function HarmonicPhraseProcessor() {
  const root = document.createElement('div');
  
  root.innerHTML = `
    <h2>🎵 Harmonic Phrase Processor</h2>
    <div class="subtitle" style="margin-top: 0.5rem">→ Enter text below → Click "Process Phrase" to analyze harmonic patterns and φ-ratios</div>
    
    <div class="tabs" style="margin-bottom: var(--space-phi)">
      <button class="tab active" data-tab="processor">Processor</button>
      <button class="tab" data-tab="library">Phrase Library</button>
    </div>

    <!-- Processor Tab -->
    <div id="processorTab" class="tab-content">
      <div class="code-border">
        <p class="subtitle">ℹ️ Enter a "silly name" or text → Process through harmonic detection → Apply focused correction algorithms</p>
      </div>

      <div class="controls" style="margin-top: var(--space-phi)">
        <label class="subtitle">Input Text</label>
        <textarea class="textarea" id="inputText" rows="4" placeholder="Enter text or harmonic phrase...">Goose's Archive</textarea>

        <div class="row" style="margin-top: var(--space-phi-minus)">
          <button class="btn" id="processBtn">🔮 Process Phrase</button>
          <button class="btn secondary" id="correctBtn">✨ Apply Correction</button>
          <button class="btn secondary" id="analyzeBtn">📊 Analyze</button>
        </div>

        <div style="margin-top: var(--space-phi)">
          <h3>Processing Results</h3>
          <pre id="processResult" class="fingerprint" style="max-height: 200px; overflow-y: auto">Results will appear here...</pre>
        </div>

        <div style="margin-top: var(--space-phi)">
          <h3>Correction Results</h3>
          <pre id="correctResult" class="fingerprint" style="max-height: 200px; overflow-y: auto">Corrections will appear here...</pre>
        </div>
      </div>
    </div>

    <!-- Library Tab -->
    <div id="libraryTab" class="tab-content hidden">
      <div class="code-border">
        <p class="subtitle">Known harmonic phrases with mathematical solution mappings. Click to process.</p>
      </div>

      <div id="phraseLibrary" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-phi); margin-top: var(--space-phi)"></div>
    </div>
  `;

  const inputText = root.querySelector('#inputText');
  const processResult = root.querySelector('#processResult');
  const correctResult = root.querySelector('#correctResult');
  const phraseLibrary = root.querySelector('#phraseLibrary');

  // Tab switching
  const tabs = root.querySelectorAll('.tab');
  const processorTab = root.querySelector('#processorTab');
  const libraryTab = root.querySelector('#libraryTab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const target = tab.getAttribute('data-tab');
      if (target === 'processor') {
        processorTab.classList.remove('hidden');
        libraryTab.classList.add('hidden');
      } else {
        processorTab.classList.add('hidden');
        libraryTab.classList.remove('hidden');
      }
    });
  });

  // Process harmonic phrase
  async function processPhrase(text) {
    try {
      processResult.textContent = '⏳ Processing harmonic phrase...';
      
      const resp = await fetch(`${API_BASE}/api/mathematical/harmonic-phrase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase: text })
      });
      
      if (!resp.ok) throw new Error('API unavailable');
      
      const data = await resp.json();
      
      let output = '🔮 Harmonic Phrase Analysis\n\n';
      output += `Original: "${data.phrase}"\n`;
      output += `Detected: ${data.detected ? '✅' : '❌'}\n`;
      output += `Solution Type: ${data.solutionType || 'None'}\n\n`;
      
      if (data.solution) {
        output += '📊 Solution Data:\n';
        output += JSON.stringify(data.solution, null, 2);
      }
      
      processResult.textContent = output;
    } catch (e) {
      processResult.textContent = `❌ Error: ${e.message}\n\nBackend may not be running. Start with: npm start`;
    }
  }

  // Apply focused correction
  async function applyCorrection(text) {
    try {
      correctResult.textContent = '⏳ Applying focused correction...';
      
      const resp = await fetch(`${API_BASE}/api/mathematical/correct-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!resp.ok) throw new Error('API unavailable');
      
      const data = await resp.json();
      
      let output = '✨ Focused Correction Results\n\n';
      output += `Original: "${data.original}"\n`;
      output += `Corrected: "${data.corrected}"\n`;
      output += `Changes: ${data.changeCount || 0}\n\n`;
      
      if (data.details) {
        output += '📝 Change Details:\n';
        output += JSON.stringify(data.details, null, 2);
      }
      
      correctResult.textContent = output;
    } catch (e) {
      correctResult.textContent = `❌ Error: ${e.message}\n\nBackend may not be running.`;
    }
  }

  // Analyze with force balance
  async function analyzeText(text) {
    try {
      processResult.textContent = '⏳ Analyzing force balance...';
      
      const resp = await fetch(`${API_BASE}/api/mathematical/force-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      if (!resp.ok) throw new Error('API unavailable');
      
      const data = await resp.json();
      
      let output = '⚖️ Force Balance Analysis\n\n';
      output += `Angel Force: ${data.angelForce}\n`;
      output += `Daemon Force: ${data.daemonForce}\n`;
      output += `Balance: ${data.balance}\n`;
      output += `Status: ${data.balanced ? '✅ Balanced' : '⚠️ Unbalanced'}\n\n`;
      output += JSON.stringify(data, null, 2);
      
      processResult.textContent = output;
    } catch (e) {
      processResult.textContent = `❌ Error: ${e.message}`;
    }
  }

  // Render phrase library
  function renderLibrary() {
    const phrases = [
      { name: "Goose's Archive", desc: 'Archive correction solution', color: '#ffb703' },
      { name: "BYTES BLYTES LYTS", desc: 'Bytes progression pattern', color: '#4CAF50' },
      { name: "Adam D. McCarty", desc: 'Name correction mapping', color: '#61dafb' },
      { name: "Henry 7-14-49", desc: 'Sacred progression', color: '#ff5722' },
      { name: "Mirror Repunit", desc: 'Palindromic number system', color: '#9c27b0' },
      { name: "Golden Spiral", desc: 'φ-based geometry', color: '#ff9800' }
    ];

    phrases.forEach(phrase => {
      const card = document.createElement('div');
      card.className = 'device-card';
      card.style.cursor = 'pointer';
      card.style.borderColor = phrase.color;
      card.innerHTML = `
        <div class="device-title" style="color: ${phrase.color}">${phrase.name}</div>
        <div class="device-meta">${phrase.desc}</div>
      `;
      
      card.addEventListener('click', () => {
        inputText.value = phrase.name;
        tabs[0].click(); // Switch to processor tab
        processPhrase(phrase.name);
      });
      
      phraseLibrary.appendChild(card);
    });
  }

  // Event listeners
  root.querySelector('#processBtn').addEventListener('click', () => {
    const text = inputText.value.trim();
    if (text) processPhrase(text);
  });

  root.querySelector('#correctBtn').addEventListener('click', () => {
    const text = inputText.value.trim();
    if (text) applyCorrection(text);
  });

  root.querySelector('#analyzeBtn').addEventListener('click', () => {
    const text = inputText.value.trim();
    if (text) analyzeText(text);
  });

  // Initialize library
  renderLibrary();

  return root;
}
