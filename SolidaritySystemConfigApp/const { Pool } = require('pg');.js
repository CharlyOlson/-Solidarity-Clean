const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL // set this in your .env
});
module.exports = pool;

Backend
CREATE TABLE memories (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  category VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  relevance INTEGER DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

// backend/memoryService.js
const pool = require('./db');

async function addMemory(userId, category, content, relevance = 0) {
  const result = await pool.query(
    'INSERT INTO memories (user_id, category, content, relevance) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, category, content, relevance]
  );
  return result.rows[0];
}

module.exports = { addMemory };