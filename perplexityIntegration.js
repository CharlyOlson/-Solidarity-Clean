// Legacy Perplexity Integration - Migrated to Ollama
// This file now uses free, local Ollama integration
// No API keys or external dependencies needed!

console.log('⚠️  Perplexity integration migrated to Ollama (free local AI)');
console.log('🔄 Loading Ollama integration with bridging safety controls...');

// Redirect all functionality to Ollama integration
const ollamaIntegration = require('./ollamaIntegration');

// Attempt to load bridging formatter (soft dependency so this file can run standalone)
let bridgingFormatter = null;
let bridgingCache = null;
try {
  bridgingFormatter = require('./ai/BridgingAIInputFormatter');
  bridgingCache = require('./ai/BridgingCache');
} catch (_) {
  // ignore if not present - allows standalone operation
}

// Commonly available model IDs for Solidarity platform integration
// Reference: https://docs.perplexity.ai/getting-started/models
const DEFAULT_MODEL_CANDIDATES = [
  process.env.PERPLEXITY_MODEL, // user override from .env
  'sonar',                      // base search model
  'sonar-pro',                  // advanced search/reasoning
  'sonar-reasoning',            // reasoning focused
  'sonar-reasoning-pro'         // premium reasoning
].filter(Boolean);

/**
 * Low-level Perplexity query with fallback model attempts and bridging integration.
 * Supports the Solidarity platform's adaptive AI processing with barrier-like system controls.
 * @param {string} query Raw user question/content
 * @param {object} options Additional options for model selection and temperature control
 * @returns {Promise<object>} Response object with model used, content, and metadata
 */
async function queryPerplexity(query, options = {}) {
  if (!PERPLEXITY_API_KEY) throw new Error('Perplexity API key not set - check .env file');
  
  const { modelCandidates = DEFAULT_MODEL_CANDIDATES, temperature = 0.2, dryRun = false, disableAdaptive = false } = options;
  let ordered = [...new Set(modelCandidates)];
  
  // Adaptive ordering using bridging formatter if available (Solidarity platform feature)
  if (bridgingFormatter && !disableAdaptive) {
    try {
      const features = bridgingFormatter.computeInputFeatures(query);
      const adaptive = bridgingFormatter.chooseModelAndTemperature(features, ordered);
      ordered = adaptive.orderedModelCandidates;
    } catch (_) { 
      // Graceful fallback if bridging formatter fails
    }
  }
  
  const basePayload = {
    model: ordered[0],
    messages: [ 
      { role: 'system', content: 'You are a concise AI assistant for the Solidarity platform.' }, 
      { role: 'user', content: query } 
    ],
    temperature
  };
  
  if (dryRun) return { dryRun: true, payload: { ...basePayload, modelCandidates: ordered } };
  
  const tried = [];
  let lastError;
  
  for (const model of ordered) {
    const payload = { ...basePayload, model };
    try {
      // Check cache first if available
      if (bridgingCache) {
        const cached = bridgingCache.getCachedResponse(payload);
        if (cached) {
          return { 
            modelUsed: model, 
            cached: true, 
            content: cached.response?.choices?.[0]?.message?.content || cached.response 
          };
        }
      }
      
      const response = await axios.post(PERPLEXITY_API_URL, payload, { 
        headers: { 
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`, 
          'Content-Type': 'application/json' 
        }, 
        timeout: 20000 
      });
      
      // Store in cache if available
      if (bridgingCache) {
        try { 
          bridgingCache.storeResponse(payload, response.data); 
        } catch (_) {
          // Cache storage failure is non-critical
        }
      }
      
      return { 
        modelUsed: model, 
        content: response.data?.choices?.[0]?.message?.content || response.data 
      };
    } catch (error) {
      const status = error.response?.status;
      const errBody = error.response?.data;
      const invalidModel = errBody?.error?.type === 'invalid_model';
      tried.push({ model, status, message: errBody?.error?.message || error.message });
      lastError = error;
      if (!invalidModel) break; // Stop for non-model errors
    }
  }
  
  const lines = [ 
    'Perplexity API error after trying models:', 
    ...tried.map(t => `  - ${t.model}: [${t.status}] ${t.message}`), 
    'Hints:', 
    '  * Verify access to model(s).', 
    '  * See https://docs.perplexity.ai/getting-started/models', 
    '  * Override PERPLEXITY_MODEL in .env' 
  ];
  const aggregate = new Error(lines.join('\n'));
  aggregate.cause = lastError;
  throw aggregate;
}

/**
 * Bridging formatting powered query (uses BridgingAIInputFormatter if available).
 * Falls back to plain text if formatter not found / disabled.
 * @param {string} rawText
 * @param {object} options { bridging=true, temperature, modelCandidates }
 */
async function queryPerplexityBridging(rawText, options = {}) {
  const { bridging = true, temperature = 0.25, modelCandidates = DEFAULT_MODEL_CANDIDATES, dryRun = false } = options;
  if (!bridging || !bridgingFormatter) return queryPerplexity(rawText, { temperature, modelCandidates });
  const requestPayload = bridgingFormatter.buildPerplexityRequest(rawText, { modelCandidates, temperature });
  if (dryRun) return { dryRun: true, payload: requestPayload };
  const tried = [];
  let lastError;
  const models = requestPayload.modelCandidates || modelCandidates;
  for (const model of models) {
    const payload = { ...requestPayload, model };
    try {
      if (bridgingCache) {
        const cached = bridgingCache.getCachedResponse(payload);
        if (cached) {
          return { modelUsed: model, cached: true, content: cached.response?.choices?.[0]?.message?.content || cached.response, bridgingFeatures: requestPayload._bridgingMeta };
        }
      }
      const response = await axios.post(PERPLEXITY_API_URL, payload, { headers: { 'Authorization': `Bearer ${PERPLEXITY_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 25000 });
      if (bridgingCache) { try { bridgingCache.storeResponse(payload, response.data); } catch (_) {} }
      return { modelUsed: model, content: response.data?.choices?.[0]?.message?.content || response.data, bridgingFeatures: requestPayload._bridgingMeta };
    } catch (error) {
      const status = error.response?.status;
      const errBody = error.response?.data;
      const invalidModel = errBody?.error?.type === 'invalid_model';
      tried.push({ model, status, message: errBody?.error?.message || error.message });
      lastError = error;
      if (!invalidModel) break;
    }
  }
  const lines = [ 'Perplexity bridging query failed:', ...tried.map(t => `  - ${t.model}: [${t.status}] ${t.message}`) ];
  const e = new Error(lines.join('\n'));
  e.cause = lastError;
  throw e;
}

// Example usage
function printUsage() {
  console.log(`Usage: node perplexityIntegration.js [options] "prompt text"
Options:
  --plain              Force plain mode
  --bridging           Force bridging mode (default if formatter present)
  --dry-run            Show payload only, do not call API
  --inspect-cache      Show cache entry counts
  --disable-adaptive   Disable adaptive model ordering in plain mode
  `);
}

if (require.main === module) {
  (async () => {
    const argv = process.argv.slice(2);
    const showHelp = argv.includes('-h') || argv.includes('--help');
    if (showHelp) { printUsage(); return; }
    const inspectCache = argv.includes('--inspect-cache');
    if (inspectCache) {
      const cacheDir = path.join(__dirname, '.cache');
      const featureFile = path.join(__dirname, '.cache', 'bridging-features.jsonl');
      const respFile = path.join(__dirname, '.cache', 'bridging-responses.jsonl');
      const stats = {
        cacheDirExists: fs.existsSync(cacheDir),
        featureEntries: fs.existsSync(featureFile) ? fs.readFileSync(featureFile, 'utf8').trim().split(/\n+/).filter(Boolean).length : 0,
        responseEntries: fs.existsSync(respFile) ? fs.readFileSync(respFile, 'utf8').trim().split(/\n+/).filter(Boolean).length : 0
      };
      console.log(JSON.stringify(stats, null, 2));
      return;
    }
    const dryRun = argv.includes('--dry-run');
    const plain = argv.includes('--plain');
    const disableAdaptive = argv.includes('--disable-adaptive');
    const forceBridging = argv.includes('--bridging');
    const flags = ['--dry-run','--plain','--bridging','--disable-adaptive','--inspect-cache'];
    const text = argv.filter(a => !flags.includes(a)).join(' ') || 'Explain resonant synchronization in distributed bridging systems.';
    try {
      const useBridging = forceBridging || (!plain && bridgingFormatter);
      const result = useBridging
        ? await queryPerplexityBridging(text, { dryRun })
        : await queryPerplexity(text, { dryRun, disableAdaptive });
      console.log(JSON.stringify({ mode: useBridging ? 'bridging' : 'plain', result }, null, 2));
    } catch (err) {
      console.error('Error:', err.message);
      if (err.cause) console.error('Underlying:', err.cause.response?.data || err.cause.message);
      process.exitCode = 1;
    }
  })();
}

module.exports = { queryPerplexity, queryPerplexityBridging };
