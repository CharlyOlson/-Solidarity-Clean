/*
 * SOLIDARITY PLATFORM - CENTRAL LOGGER
 * ====================================
 *
 * Unified logging for all modules (info, warn, error, metrics).
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * Repository: https://github.com/CharlyOlson/-Solidarity-Clean
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const fs = require('fs');
const path = require('path');

const logDir = path.join(process.cwd(), 'logs');
try { if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true }); } catch (_) { /* ok */ }
const logFile = path.join(logDir, 'solidarity.log');

let fileLoggingAvailable = true;
// Verify we can actually write to the log file (OneDrive/cloud sync can block this)
try { fs.appendFileSync(logFile, ''); } catch (_) { fileLoggingAvailable = false; }

function format(level, message, meta) {
  const ts = new Date().toISOString();
  return `${ts} [${level}] ${message}${meta ? ' ' + JSON.stringify(meta) : ''}`;
}

function writeToFile(line) {
  if (!fileLoggingAvailable) return;
  try { fs.appendFileSync(logFile, line + '\n'); } catch (_) { fileLoggingAvailable = false; }
}

const logger = {
  info: (msg, meta) => {
    const line = format('INFO', msg, meta);
    writeToFile(line);
    if (process.env.NODE_ENV !== 'production') console.log(line);
  },
  warn: (msg, meta) => {
    const line = format('WARN', msg, meta);
    writeToFile(line);
    if (process.env.NODE_ENV !== 'production') console.warn(line);
  },
  error: (msg, meta) => {
    const line = format('ERROR', msg, meta);
    writeToFile(line);
    if (process.env.NODE_ENV !== 'production') console.error(line);
  },
  metric: (name, value, meta) => {
    const line = format('METRIC', `${name}: ${value}`, meta);
    writeToFile(line);
    if (process.env.NODE_ENV !== 'production') console.log(line);
  }
};

module.exports = logger;
