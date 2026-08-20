/*
 * SOLIDARITY PLATFORM - OLLAMA MOCK
 * ===================================
 *
 * Jest mock for ai_integration/ollama_integration.js
 * Returns deterministic responses so tests run without a live Ollama server.
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const { BRIDGING_BASELINE } = require('../../src/utils/constants');

const AI_SAFETY_THRESHOLDS = {
  OPTIMAL_RANGE: {
    min: 0.25, max: 0.75,
    mode: 'full_capability',
    models: ['llama3.2:3b'],
    maxTokens: 4000,
    temperature: 0.4,
    systemPrompt: 'Mock system prompt'
  }
};

async function queryOllama(prompt, options = {}) {
  const safetyLevel = options.safetyLevel || BRIDGING_BASELINE;
  return {
    success: true,
    content: `Mock AI response to: ${(prompt || '').substring(0, 50)}`,
    response: `Mock AI response to: ${(prompt || '').substring(0, 50)}`,
    model: 'llama3.2:3b',
    safetyLevel,
    safetyMode: 'full_capability',
    tokensUsed: 42,
    baseRatio: 1.618,
    metadata: {
      done: true,
      context: null,
      total_duration: 100000,
      eval_duration: 50000,
      prompt_eval_count: 10
    }
  };
}

function getAISystemStatus() {
  return {
    timestamp: new Date().toISOString(),
    currentSafetyLevel: BRIDGING_BASELINE,
    safetyMode: 'OPTIMAL_RANGE',
    safetyRange: '0.250-0.750',
    baseRatio: 1.618,
    bridgingBaseline: BRIDGING_BASELINE,
    recommendedModels: ['llama3.2:3b'],
    maxTokens: 4000,
    temperature: 0.4,
    systemPrompt: 'Mock system prompt'
  };
}

function assessAISafety(safetyLevel = BRIDGING_BASELINE) {
  return {
    level: 'OPTIMAL_RANGE',
    ...AI_SAFETY_THRESHOLDS.OPTIMAL_RANGE,
    currentSafetyLevel: safetyLevel,
    baseRatio: 1.618,
    bridgingBaseline: BRIDGING_BASELINE
  };
}

async function checkOllamaStatus() {
  return { running: true, models: [{ name: 'llama3.2:3b' }], modelCount: 1, recommendations: [] };
}

async function processWithSolidarityContext(query, context = {}) {
  return queryOllama(query, context);
}

function harmonizeAIWithSystem() {
  return assessAISafety();
}

function setAISafetyLevel(level) {
  return assessAISafety(level);
}

function emergencyAIStabilization() {
  return assessAISafety(BRIDGING_BASELINE);
}

async function pullModel(name) {
  return { success: true, model: name };
}

async function listModels() {
  return [{ name: 'llama3.2:3b' }];
}

module.exports = {
  queryOllama,
  checkOllamaStatus,
  processWithSolidarityContext,
  harmonizeAIWithSystem,
  setAISafetyLevel,
  emergencyAIStabilization,
  assessAISafety,
  pullModel,
  listModels,
  getAISystemStatus,
  AI_SAFETY_THRESHOLDS
};
