/*
 * SOLIDARITY PLATFORM - DATABASE
 * ===============================
 *
 * SQLite persistence layer using better-sqlite3
 *
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'solidarity.db'));

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    safety_level REAL DEFAULT 0.618
  );

  CREATE TABLE IF NOT EXISTS hanko_stamps (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT DEFAULT 'personal',
    inputs TEXT DEFAULT '{}',
    preview TEXT DEFAULT '{}',
    status TEXT DEFAULT 'active',
    convergence_score REAL DEFAULT 0.618,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    user_id TEXT PRIMARY KEY,
    theme TEXT DEFAULT 'dark',
    safety_level REAL DEFAULT 0.618,
    notifications INTEGER DEFAULT 1,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT,
    details TEXT DEFAULT '{}',
    timestamp TEXT DEFAULT (datetime('now'))
  );
`);

// ═══════════════════════════════════════════════════════════════════════════
// PREPARED STATEMENTS
// ═══════════════════════════════════════════════════════════════════════════

const stmts = {
  // Users
  createUser: db.prepare(
    'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)'
  ),
  findUserByUsername: db.prepare(
    'SELECT * FROM users WHERE username = ?'
  ),
  findUserById: db.prepare(
    'SELECT id, username, safety_level, created_at FROM users WHERE id = ?'
  ),

  // Hanko Stamps
  createStamp: db.prepare(
    'INSERT INTO hanko_stamps (id, user_id, type, inputs, preview, convergence_score) VALUES (?, ?, ?, ?, ?, ?)'
  ),
  getStampsByUser: db.prepare(
    'SELECT * FROM hanko_stamps WHERE user_id = ? ORDER BY created_at DESC'
  ),
  getStampById: db.prepare(
    'SELECT * FROM hanko_stamps WHERE id = ?'
  ),
  revokeStamp: db.prepare(
    'UPDATE hanko_stamps SET status = ? WHERE id = ? AND user_id = ?'
  ),

  // User Settings
  getSettings: db.prepare(
    'SELECT * FROM user_settings WHERE user_id = ?'
  ),
  upsertSettings: db.prepare(`
    INSERT INTO user_settings (user_id, theme, safety_level, notifications, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      theme = excluded.theme,
      safety_level = excluded.safety_level,
      notifications = excluded.notifications,
      updated_at = datetime('now')
  `),

  // Activity Logs
  insertLog: db.prepare(
    'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)'
  ),
  getRecentLogs: db.prepare(
    'SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ?'
  ),
  getLogsByUser: db.prepare(
    'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?'
  ),

  // Cleanup (keep last 10000 logs)
  trimLogs: db.prepare(
    'DELETE FROM activity_logs WHERE id NOT IN (SELECT id FROM activity_logs ORDER BY timestamp DESC LIMIT 10000)'
  )
};

module.exports = { db, stmts };
