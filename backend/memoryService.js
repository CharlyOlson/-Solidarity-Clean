const pool = require('./db');
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'memory.log');

async function addMemory(userId, category, content, relevance = 0) {
  const result = await pool.query(
    'INSERT INTO memories (user_id, category, content, relevance) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, category, content, relevance]
  );
  const memory = result.rows[0];
  appendLog(memory);
  return memory;
}

async function listMemories(userId, limit = 50) {
  const result = await pool.query(
    'SELECT * FROM memories WHERE user_id = $1 ORDER BY timestamp DESC LIMIT $2',
    [userId, limit]
  );
  return result.rows;
}

function appendLog(memory) {
  const line = `${new Date().toISOString()} user:${memory.user_id} category:${memory.category} relevance:${memory.relevance} content:${memory.content}\n`;
  fs.appendFile(logPath, line, err => {
    if (err) console.error('log append failed', err);
  });
}

module.exports = { addMemory, listMemories };
