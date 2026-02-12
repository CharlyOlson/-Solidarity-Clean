// Simple one-time table creator for memories table
// Run with: node createTable.js

const pool = require('./db');

const createMemoriesSql = `
CREATE TABLE IF NOT EXISTS memories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  category VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  relevance INTEGER DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set. Set it then re-run: $env:DATABASE_URL="postgresql://user:pass@localhost:5432/solidarity_db"');
    await pool.end();
    return;
  }

  try {
    await pool.query(createMemoriesSql);
    console.log('✅ memories table is ready');
  } catch (err) {
    console.error('❌ Failed to create memories table:', err.message || err);
    if (err && err.stack) console.error(err.stack);
  } finally {
    await pool.end();
  }
}

main();
