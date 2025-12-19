/**
 * SOLIDARITY PLATFORM - USER DASHBOARD
 * Real-time statistics and activity overview
 */

const API_BASE = '';

export function Dashboard() {
  const root = document.createElement('div');
  
  root.innerHTML = `
    <h2>🏠 Dashboard — Welcome, <span id="dashUserName">User</span></h2>
    <div class="subtitle" style="margin-top: 0.5rem">→ View real-time stats, check system health, and access quick actions below</div>
    
    <div class="dashboard-grid" style="margin-top: var(--space-phi)">
      <div class="stat-card">
        <h3>🔒 Lock Gate Operations</h3>
        <div class="stat-value" id="lockGateCount">0</div>
        <div class="stat-label">Total verifications</div>
      </div>
      
      <div class="stat-card">
        <h3>🔄 Device Swaps</h3>
        <div class="stat-value" id="swapCount">0</div>
        <div class="stat-label">Successful exchanges</div>
      </div>
      
      <div class="stat-card">
        <h3>📝 Quip Notes</h3>
        <div class="stat-value" id="notesCount">0</div>
        <div class="stat-label">Total notes created</div>
      </div>
      
      <div class="stat-card">
        <h3>⚖️ System Balance</h3>
        <div class="stat-value" id="balanceValue">0.618</div>
        <div class="stat-label">φ-ratio safety level</div>
      </div>
    </div>

    <div style="margin-top: var(--space-phi-squared)">
      <h3>📊 System Status</h3>
      <div class="code-border">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-phi-minus)">
          <div>
            <div class="subtitle">API Server</div>
            <div id="apiStatus" style="color: #4CAF50; font-weight: 700">● Online</div>
          </div>
          <div>
            <div class="subtitle">Lock Gate</div>
            <div id="lockGateStatus" style="color: #4CAF50; font-weight: 700">● Operational</div>
          </div>
          <div>
            <div class="subtitle">Device Exchange</div>
            <div id="deviceStatus" style="color: #4CAF50; font-weight: 700">● Active</div>
          </div>
          <div>
            <div class="subtitle">Safety Level</div>
            <div style="color: #ffb703; font-weight: 700">0.618 φ</div>
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top: var(--space-phi-squared)">
      <h3>🕐 Recent Activity</h3>
      <div class="activity-timeline" id="activityTimeline">
        <div class="activity-item">
          <div class="activity-time">Just now</div>
          <div class="activity-desc">Dashboard loaded successfully</div>
        </div>
      </div>
    </div>

    <div style="margin-top: var(--space-phi-squared)">
      <h3>🎯 Quick Actions</h3>
      <div class="row" style="gap: var(--space-phi-minus); flex-wrap: wrap">
        <button class="btn" id="quickLockGate">🔒 New Lock Gate</button>
        <button class="btn" id="quickNote">📝 New Note</button>
        <button class="btn secondary" id="quickSwap">🔄 Device Swap</button>
        <button class="btn secondary" id="refreshDash">🔃 Refresh</button>
      </div>
    </div>
  `;

  const lockGateCount = root.querySelector('#lockGateCount');
  const swapCount = root.querySelector('#swapCount');
  const notesCount = root.querySelector('#notesCount');
  const balanceValue = root.querySelector('#balanceValue');
  const activityTimeline = root.querySelector('#activityTimeline');
  const dashUserName = root.querySelector('#dashUserName');

  // Load user data
  function loadDashboard() {
    const user = JSON.parse(localStorage.getItem('solidarityUser') || '{}');
    if (user.username) {
      dashUserName.textContent = user.username;
    }

    // Load stats from localStorage
    const stats = JSON.parse(localStorage.getItem('solidarityStats') || '{"lockGate":0,"swaps":0,"notes":0}');
    lockGateCount.textContent = stats.lockGate || 0;
    swapCount.textContent = stats.swaps || 0;
    notesCount.textContent = stats.notes || 0;

    // Load recent activity
    const activities = JSON.parse(localStorage.getItem('solidarityActivity') || '[]');
    if (activities.length > 0) {
      activityTimeline.innerHTML = activities.slice(0, 10).map(a => `
        <div class="activity-item">
          <div class="activity-time">${formatTime(a.timestamp)}</div>
          <div class="activity-desc">${a.description}</div>
        </div>
      `).join('');
    }

    // Load system balance
    fetchSystemBalance();
  }

  async function fetchSystemBalance() {
    try {
      const resp = await fetch(`${API_BASE}/devices/balance`, { method: 'POST' });
      if (resp.ok) {
        const data = await resp.json();
        balanceValue.textContent = data.balance.toFixed(3);
      }
    } catch (e) {
      console.log('Balance fetch offline:', e);
    }
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  }

  function addActivity(description) {
    const activities = JSON.parse(localStorage.getItem('solidarityActivity') || '[]');
    activities.unshift({
      timestamp: new Date().toISOString(),
      description
    });
    localStorage.setItem('solidarityActivity', JSON.stringify(activities.slice(0, 50)));
    loadDashboard();
  }

  // Quick actions
  root.querySelector('#quickLockGate').addEventListener('click', () => {
    document.querySelector('[data-target="lockgate"]').click();
    addActivity('Navigated to Lock Gate');
  });

  root.querySelector('#quickNote').addEventListener('click', () => {
    document.querySelector('[data-target="notes"]').click();
    addActivity('Navigated to Quip Notes');
  });

  root.querySelector('#quickSwap').addEventListener('click', () => {
    document.querySelector('[data-target="exchange"]').click();
    addActivity('Navigated to Device Exchange');
  });

  root.querySelector('#refreshDash').addEventListener('click', () => {
    loadDashboard();
    addActivity('Dashboard refreshed');
  });

  // Initial load
  loadDashboard();

  // Auto-refresh every 10 seconds
  setInterval(loadDashboard, 10000);

  return root;
}
