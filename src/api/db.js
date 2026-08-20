/*
 * SOLIDARITY PLATFORM - DATABASE
 * ===============================
 *
 * SQLite persistence layer using better-sqlite3
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Railway auto-sets RAILWAY_VOLUME_MOUNT_PATH when a volume is attached.
// Fall back to DATA_DIR env var or local ./data for development.
const volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.env.RAILWAY_VOLUME_MOUNT;
const DATA_DIR = volumePath
  ? path.join(volumePath, 'db')
  : process.env.DATA_DIR || path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'solidarity.db'));

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA
// Note: DEFAULT 0.618 values correspond to BRIDGING_BASELINE (PHI_RECIPROCAL)
// from src/utils/constants.js — keep in sync if the constant changes.
// ═══════════════════════════════════════════════════════════════════════════

try {
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

CREATE TABLE IF NOT EXISTS financial_wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  wallet_name TEXT NOT NULL,
  chain TEXT NOT NULL,
  address TEXT NOT NULL,
  signer_identity TEXT NOT NULL,
  public_key TEXT NOT NULL,
  private_key TEXT NOT NULL, -- AES-256-GCM encrypted; never stored in plaintext
  safety_level REAL DEFAULT 0.618,
  node INTEGER DEFAULT 7,
  balance REAL DEFAULT 0,
  status TEXT DEFAULT 'active',
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_financial_wallets_user_id
  ON financial_wallets (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_wallets_user_name
  ON financial_wallets (user_id, wallet_name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_wallets_user_address
  ON financial_wallets (user_id, address);

CREATE TABLE IF NOT EXISTS financial_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  wallet_id TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount REAL NOT NULL,
  chain TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'created',
  safety_level REAL DEFAULT 0.618,
  signer_identity TEXT NOT NULL,
  public_key TEXT NOT NULL,
  signature TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  verification_status INTEGER DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  executed_at TEXT,
  FOREIGN KEY (wallet_id) REFERENCES financial_wallets(id)
);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id
  ON financial_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_wallet_id
  ON financial_transactions (wallet_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status
  ON financial_transactions (status);

CREATE TABLE IF NOT EXISTS transaction_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  signature TEXT NOT NULL,
  signer_identity TEXT NOT NULL,
  old_values TEXT,
  new_values TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_transaction_audit_user_id
  ON transaction_audit (user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_audit_transaction_id
  ON transaction_audit (transaction_id);

CREATE TRIGGER IF NOT EXISTS prevent_transaction_audit_update
BEFORE UPDATE ON transaction_audit
BEGIN
  SELECT RAISE(ABORT, 'transaction_audit is append-only');
END;

CREATE TRIGGER IF NOT EXISTS prevent_transaction_audit_delete
BEFORE DELETE ON transaction_audit
BEGIN
  SELECT RAISE(ABORT, 'transaction_audit is append-only');
END;

CREATE TABLE IF NOT EXISTS financial_batches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  operation_count INTEGER NOT NULL,
  operations TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  estimated_savings REAL DEFAULT 0,
  actual_savings REAL DEFAULT 0,
  safety_level REAL DEFAULT 0.618,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_financial_batches_user_id
  ON financial_batches (user_id);

CREATE TABLE IF NOT EXISTS smart_contracts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  contract_name TEXT NOT NULL,
  chain TEXT NOT NULL,
  address TEXT NOT NULL,
  abi TEXT DEFAULT '[]',
  state TEXT DEFAULT '{}',
  test_mode INTEGER DEFAULT 1,
  safety_level REAL DEFAULT 0.618,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_smart_contracts_user_id
  ON smart_contracts (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_smart_contracts_user_name
  ON smart_contracts (user_id, contract_name);

CREATE TABLE IF NOT EXISTS session_completion_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  status TEXT NOT NULL,
  files_modified INTEGER DEFAULT 0,
  tests_passing INTEGER DEFAULT 0,
  vulnerabilities_fixed INTEGER DEFAULT 0,
  metrics TEXT DEFAULT '{}',
  completed_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_session_completion_reports_user_id
  ON session_completion_reports (user_id);
`);
} catch (err) {
  logger.error('Schema initialization error', { error: err.message });
  throw err;
}

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
  ),

  // Financial wallets
  insertFinancialWallet: db.prepare(`
    INSERT INTO financial_wallets (
      id, user_id, wallet_name, chain, address, signer_identity, public_key, private_key,
      safety_level, node, balance, status, metadata, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `),
  getFinancialWalletById: db.prepare(
    'SELECT * FROM financial_wallets WHERE id = ? AND user_id = ?'
  ),
  getFinancialWalletByAddress: db.prepare(
    'SELECT * FROM financial_wallets WHERE address = ? AND user_id = ?'
  ),
  listFinancialWalletsByUser: db.prepare(
    'SELECT * FROM financial_wallets WHERE user_id = ? ORDER BY created_at DESC'
  ),
  updateFinancialWalletBalance: db.prepare(
    "UPDATE financial_wallets SET balance = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
  ),

  // Financial transactions
  insertFinancialTransaction: db.prepare(`
    INSERT INTO financial_transactions (
      id, user_id, wallet_id, from_address, to_address, amount, chain, type, status,
      safety_level, signer_identity, public_key, signature, transaction_hash,
      verification_status, metadata, updated_at, executed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
  `),
  getFinancialTransactionById: db.prepare(
    'SELECT * FROM financial_transactions WHERE id = ? AND user_id = ?'
  ),
  listFinancialTransactionsByUser: db.prepare(
    'SELECT * FROM financial_transactions WHERE user_id = ? ORDER BY created_at DESC'
  ),
  updateFinancialTransaction: db.prepare(`
    UPDATE financial_transactions
    SET to_address = ?, amount = ?, type = ?, status = ?, safety_level = ?, signer_identity = ?,
        public_key = ?, signature = ?, transaction_hash = ?, verification_status = ?, metadata = ?,
        updated_at = datetime('now'), executed_at = ?
    WHERE id = ? AND user_id = ?
  `),

  // Immutable audit
  insertTransactionAudit: db.prepare(`
    INSERT INTO transaction_audit (
      transaction_id, user_id, operation, transaction_hash, signature, signer_identity, old_values, new_values
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  listTransactionAuditByTransaction: db.prepare(
    'SELECT * FROM transaction_audit WHERE transaction_id = ? AND user_id = ? ORDER BY id ASC'
  ),

  // Financial batches
  insertFinancialBatch: db.prepare(`
    INSERT INTO financial_batches (
      id, user_id, operation_count, operations, status, estimated_savings, actual_savings, safety_level, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `),
  listFinancialBatchesByUser: db.prepare(
    'SELECT * FROM financial_batches WHERE user_id = ? ORDER BY created_at DESC'
  ),

  // Smart contracts
  insertSmartContract: db.prepare(`
    INSERT INTO smart_contracts (
      id, user_id, contract_name, chain, address, abi, state, test_mode, safety_level, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `),
  updateSmartContractState: db.prepare(
    "UPDATE smart_contracts SET state = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
  ),
  listSmartContractsByUser: db.prepare(
    'SELECT * FROM smart_contracts WHERE user_id = ? ORDER BY created_at DESC'
  ),
  getSmartContractByName: db.prepare(
    'SELECT * FROM smart_contracts WHERE contract_name = ? AND user_id = ?'
  ),
  getSmartContractById: db.prepare(
    'SELECT * FROM smart_contracts WHERE id = ? AND user_id = ?'
  ),

  // Session completion reports
  insertSessionCompletionReport: db.prepare(`
    INSERT INTO session_completion_reports (
      user_id, session_id, status, files_modified, tests_passing, vulnerabilities_fixed, metrics
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  listSessionCompletionReportsByUser: db.prepare(
    'SELECT * FROM session_completion_reports WHERE user_id = ? ORDER BY completed_at DESC'
  ),

  // Test cleanup statements
  deleteAllUsers: db.prepare('DELETE FROM users'),
  deleteAllStamps: db.prepare('DELETE FROM hanko_stamps'),
  deleteAllSettings: db.prepare('DELETE FROM user_settings'),
  deleteAllLogs: db.prepare('DELETE FROM activity_logs'),
  deleteAllFinancialTransactions: db.prepare('DELETE FROM financial_transactions'),
  deleteAllFinancialWallets: db.prepare('DELETE FROM financial_wallets'),
  deleteAllFinancialBatches: db.prepare('DELETE FROM financial_batches'),
  deleteAllSmartContracts: db.prepare('DELETE FROM smart_contracts'),
  deleteAllSessionCompletionReports: db.prepare('DELETE FROM session_completion_reports')
};

module.exports = { db, stmts };
