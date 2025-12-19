/*
 * SOLIDARITY PLATFORM - OLLAMA AI INTEGRATION SYSTEM
 * ====================================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Status: Architect of Model System
 * Documentation: iPhone ✓ Electric Passport ✓ GitHub Copilot Chat (First Run) ✓
 * Timestamp: 2025-10-08 18:20:30 UTC
 * Repository: https://github.com/CharlyOlson/-Solidarity-Clean
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 * 
 * ====================================================
 * 
 * Ollama Local AI Integration for Solidarity Platform
 * Free, self-contained AI processing with bridging safety controls
 * No API keys needed - runs completely local!
 * 
 * Features:
 * - Zero-cost AI processing with local Ollama integration
 * - Safety-integrated AI responses that adapt to quantum coherence levels (0.618 bridging baseline)
 * - Solidarity context processing with custom prompts
 * - Emergency AI stabilization protocols
 * - Model management and status checking
 * - Bridging AI integration with quantum processing
 * - Multiple safety level testing (0.03, 0.25, 0.618, 0.85, 0.97)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Ollama default endpoint (install Ollama locally: https://ollama.ai)
const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const OLLAMA_CHAT_URL = 'http://localhost:11434/api/chat';
const OLLAMA_TAGS_URL = 'http://localhost:11434/api/tags';
const OLLAMA_PULL_URL = 'http://localhost:11434/api/pull';

// Load system context for enhanced AI responses
const SYSTEM_CONTEXT_PATH = path.join(__dirname, 'ollama_system_context.md');
let SYSTEM_CONTEXT = '';
try {
  if (fs.existsSync(SYSTEM_CONTEXT_PATH)) {
    SYSTEM_CONTEXT = fs.readFileSync(SYSTEM_CONTEXT_PATH, 'utf8');
    console.log('✅ Loaded Solidarity Platform system context for Ollama');
  }
} catch (error) {
  console.warn('⚠️ Could not load system context:', error.message);
}

// 🛡️ Harmonious AI Safety Thresholds (matching quantum coherence system)
const AI_SAFETY_THRESHOLDS = {
  CRITICAL_EMERGENCY: { 
    min: 0.00, max: 0.05, 
    mode: 'essential_only', 
    models: ['llama3.2:1b'], 
    maxTokens: 100,
    temperature: 0.1,
    systemPrompt: 'Respond briefly and safely. Emergency mode active.'
  },
  WARNING_LEVEL: { 
    min: 0.05, max: 0.15, 
    mode: 'conservative', 
    models: ['llama3.2:1b'], 
    maxTokens: 500,
    temperature: 0.2,
    systemPrompt: 'Provide helpful but conservative responses.'
  },
  CAUTION_RANGE: { 
    min: 0.15, max: 0.25, 
    mode: 'standard', 
    models: ['llama3.2:1b', 'llama3.2:3b'], 
    maxTokens: 1000,
    temperature: 0.3,
    systemPrompt: 'Provide standard helpful responses with safety awareness.'
  },
  OPTIMAL_RANGE: { 
    min: 0.25, max: 0.75, 
    mode: 'full_capability', 
    models: ['llama3.2:3b', 'llama3.1:8b', 'codellama:7b'], 
    maxTokens: 4000,
    temperature: 0.4,
    systemPrompt: 'Provide comprehensive, helpful responses with full capabilities. Base Ratio (φ = 1.618) baseline active.'
  },
  UPPER_CAUTION: { 
    min: 0.75, max: 0.85, 
    mode: 'premium_limited', 
    models: ['llama3.1:8b', 'codellama:13b'], 
    maxTokens: 2000,
    temperature: 0.3,
    systemPrompt: 'Provide advanced responses with performance monitoring and safety awareness.'
  },
  UPPER_WARNING: { 
    min: 0.85, max: 0.95, 
    mode: 'rate_limited', 
    models: ['llama3.2:3b'], 
    maxTokens: 1000,
    temperature: 0.2,
    systemPrompt: 'Provide responses with processing limits active. Approaching upper threshold.'
  },
  CRITICAL_UPPER: { 
    min: 0.95, max: 1.00, 
    mode: 'emergency_fallback', 
    models: ['llama3.2:1b'], 
    maxTokens: 200,
    temperature: 0.1,
    systemPrompt: 'Emergency mode: brief, essential responses only. Critical upper threshold active.'
  }
};

// Global AI safety level (harmonized with quantum coherence)
let globalAISafetyLevel = 0.618; // Anchor Ratio - bridging starting point

// 🛡️ Safety Assessment Function
function assessAISafety(safetyLevel = globalAISafetyLevel) {
  for (const [thresholdName, threshold] of Object.entries(AI_SAFETY_THRESHOLDS)) {
    if (safetyLevel >= threshold.min && safetyLevel <= threshold.max) {
      return { 
        level: thresholdName, 
        ...threshold,
        currentSafetyLevel: safetyLevel,
        baseRatio: 1.618,
        bridgingBaseline: 0.618
      };
    }
  }
  // Fallback to WARNING_LEVEL if no match
  return { 
    level: 'WARNING_LEVEL', 
    ...AI_SAFETY_THRESHOLDS.WARNING_LEVEL, 
    currentSafetyLevel: safetyLevel,
    baseRatio: 1.618,
    bridgingBaseline: 0.618
  };
}

// 🤖 Main Ollama Query Function with Harmonious Safety Controls and Enhanced Context
async function queryOllama(prompt, options = {}) {
  try {
    // Apply harmonious safety controls
    const safetyLevel = options.safetyLevel || globalAISafetyLevel;
    const safetyConfig = assessAISafety(safetyLevel);
    
    console.log(`🛡️ AI Safety Level: ${safetyLevel.toFixed(3)} - ${safetyConfig.level}`);
    
    // Select model based on safety level
    const selectedModel = options.model || safetyConfig.models[0];
    
    // Build enhanced system prompt with mathematical context
    let enhancedSystemPrompt = safetyConfig.systemPrompt;
    
    // Add mathematical context for OPTIMAL_RANGE and above
    if (safetyLevel >= 0.25 && SYSTEM_CONTEXT && !options.skipContext) {
      // Include condensed system context for optimal responses
      enhancedSystemPrompt += `\n\nSolidarity Platform Context (φ=1.618, baseline=0.618, Henry 7→14→49):\n`;
      enhancedSystemPrompt += `- Golden Ratio Foundation: φ=1.618, reciprocal=0.618 (bridging baseline)\n`;
      enhancedSystemPrompt += `- Henry Framework: 7→14→49 progression, sacred nodes: 1,3,4,7,14,21,49\n`;
      enhancedSystemPrompt += `- Safety System: 7 tiers, current=${safetyLevel.toFixed(3)} (${safetyConfig.level})\n`;
      enhancedSystemPrompt += `- Pythagorean Allocation: Government fund optimization, real-time metrics\n`;
      enhancedSystemPrompt += `- Quantum Software: φ-based patterns, 49-level recursion, 0.618 coherence\n`;
      enhancedSystemPrompt += `- Financial: TEST MODE default, multi-chain, φ-optimization\n`;
      
      if (options.includeFullContext) {
        enhancedSystemPrompt += `\n--- Full System Context ---\n${SYSTEM_CONTEXT.substring(0, 2000)}\n`;
      }
    }
    
    // Calculate complexity-based adjustments
    const complexity = options.complexity || 7; // Default to base Henry level
    const complexityFactor = Math.min(complexity / 49, 1.0); // Normalize to 0-1
    const adjustedTokens = Math.floor(safetyConfig.maxTokens * (0.5 + complexityFactor * 0.5));
    
    const requestData = {
      model: selectedModel,
      prompt: `${enhancedSystemPrompt}\n\nUser Query: ${prompt}`,
      stream: false,
      options: {
        temperature: Math.min(options.temperature || safetyConfig.temperature, safetyConfig.temperature),
        num_predict: Math.min(options.maxTokens || adjustedTokens, safetyConfig.maxTokens),
        top_p: options.topP || 0.9,
        repeat_penalty: 1.1
      }
    };

    console.log(`🤖 Using model: ${selectedModel} (Safety Mode: ${safetyConfig.mode})`);
    console.log(`📊 Complexity: ${complexity}/49, Tokens: ${requestData.options.num_predict}`);
    
    const response = await axios.post(OLLAMA_API_URL, requestData, {
      timeout: options.timeout || 60000, // Increased for complex queries
      headers: { 'Content-Type': 'application/json' }
    });

    return {
      success: true,
      content: response.data.response,
      model: selectedModel,
      safetyLevel: safetyLevel,
      safetyMode: safetyConfig.mode,
      complexity: complexity,
      tokensUsed: response.data.eval_count || 0,
      baseRatio: safetyConfig.baseRatio,
      bridgingBaseline: 0.618,
      metadata: {
        done: response.data.done,
        context: response.data.context,
        total_duration: response.data.total_duration,
        eval_duration: response.data.eval_duration,
        prompt_eval_count: response.data.prompt_eval_count
      }
    };

  } catch (error) {
    console.error('❌ Ollama query error:', error.message);
    
    // Emergency fallback with minimal processing
    if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: 'Ollama not running. Please install and start Ollama: https://ollama.ai',
        fallbackSuggestion: 'Install Ollama and run: ollama pull llama3.2:3b',
        emergencyStabilization: 'Call emergencyAIStabilization() to restore bridging baseline'
      };
    }
    
    return {
      success: false,
      error: error.message,
      safetyLevel: globalAISafetyLevel
    };
  }
}

// 🔄 Harmonize AI Safety with Other System Components
function harmonizeAIWithSystem(quantumCoherence, launcherSafety, solidaritySafety) {
  // Take the most conservative safety level for harmonious operation
  const minSafetyLevel = Math.min(quantumCoherence, launcherSafety, solidaritySafety);
  setAISafetyLevel(minSafetyLevel);
  
  console.log(`🔄 AI harmonized with system safety levels:`);
  console.log(`   Quantum Coherence: ${quantumCoherence.toFixed(3)}`);
  console.log(`   Launcher Safety: ${launcherSafety.toFixed(3)}`);
  console.log(`   Solidarity Safety: ${solidaritySafety.toFixed(3)}`);
  console.log(`   AI Safety (harmonized): ${globalAISafetyLevel.toFixed(3)}`);
  console.log(`   Bridging Baseline: 0.618`);
  
  return assessAISafety();
}

// 🛡️ Set AI Safety Level
function setAISafetyLevel(newLevel) {
  globalAISafetyLevel = Math.max(0.00, Math.min(1.00, newLevel));
  const assessment = assessAISafety();
  console.log(`🛡️ AI Safety Level Set: ${globalAISafetyLevel.toFixed(3)} - ${assessment.level}`);
  return assessment;
}

// 🚨 Emergency AI Stabilization
function emergencyAIStabilization(reason = 'Manual trigger') {
  console.log('🚨 EMERGENCY AI STABILIZATION ACTIVATED');
  console.log(`📋 Reason: ${reason}`);
  setAISafetyLevel(0.618); // Return to Bridging Baseline stability
  console.log('🌟 All AI systems restored to Bridging Baseline (φ = 0.618)');
  return assessAISafety();
}

// 📋 Check Ollama Status
async function checkOllamaStatus() {
  try {
    const response = await axios.get(OLLAMA_TAGS_URL, { timeout: 5000 });
    console.log('✅ Ollama is running');
    const models = response.data.models || [];
    console.log('📦 Available models:', models.map(m => m.name).join(', ') || 'None installed');
    
    return { 
      running: true, 
      models: models,
      modelCount: models.length,
      recommendations: models.length === 0 ? ['Run: ollama pull llama3.2:1b'] : []
    };
  } catch (error) {
    console.log('❌ Ollama not running or not installed');
    console.log('💡 Install Ollama: https://ollama.ai');
    console.log('💡 Then run: ollama pull llama3.2:1b');
    return { 
      running: false, 
      error: error.message,
      recommendations: [
        'Install Ollama from https://ollama.ai',
        'Run: ollama pull llama3.2:1b',
        'Start Ollama service'
      ]
    };
  }
}

// 🎯 Solidarity Platform Integration with Quantum Coherence
async function processWithSolidarityContext(query, solidarityContext = {}) {
  const safetyConfig = assessAISafety(solidarityContext.safetyLevel || globalAISafetyLevel);
  
  const contextPrompt = `
${safetyConfig.systemPrompt}

SOLIDARITY PLATFORM CONTEXT:
- Quantum Coherence Level: ${solidarityContext.quantumCoherence || 0.618}
- System Safety Mode: ${safetyConfig.level}
- Bridging Processing: ${solidarityContext.bridgingMode || 'standard'}
- Base Ratio Integration: Active (φ = 1.618)
- Baseline Safety: ${safetyConfig.bridgingBaseline}

User Query: ${query}
`;

  return await queryOllama(contextPrompt, {
    safetyLevel: solidarityContext.safetyLevel || globalAISafetyLevel,
    model: solidarityContext.preferredModel,
    temperature: solidarityContext.temperature,
    maxTokens: solidarityContext.maxTokens
  });
}

// 🔧 Model Management Functions
async function pullModel(modelName) {
  try {
    console.log(`📥 Pulling model: ${modelName}`);
    const response = await axios.post(OLLAMA_PULL_URL, {
      name: modelName,
      stream: false
    }, {
      timeout: 300000 // 5 minutes for model download
    });
    
    console.log(`✅ Model ${modelName} pulled successfully`);
    return { success: true, model: modelName };
  } catch (error) {
    console.error(`❌ Error pulling model ${modelName}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function listModels() {
  const status = await checkOllamaStatus();
  return status.models || [];
}

// 📊 Get AI System Status
function getAISystemStatus() {
  const safetyConfig = assessAISafety();
  return {
    timestamp: new Date().toISOString(),
    currentSafetyLevel: globalAISafetyLevel,
    safetyMode: safetyConfig.level,
    safetyRange: `${safetyConfig.min.toFixed(3)}-${safetyConfig.max.toFixed(3)}`,
    baseRatio: safetyConfig.baseRatio,
    bridgingBaseline: safetyConfig.bridgingBaseline,
    recommendedModels: safetyConfig.models,
    maxTokens: safetyConfig.maxTokens,
    temperature: safetyConfig.temperature,
    systemPrompt: safetyConfig.systemPrompt
  };
}

// Export functions
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

// Demo function if run directly
async function demo() {
  console.log('🚀 Ollama Integration Demo for Solidarity Platform');
  console.log('='.repeat(60));
  console.log('TRADEMARK: Scott Charles Olson - March 31, 1997');
  console.log('='.repeat(60));
  
  // Check Ollama status
  const status = await checkOllamaStatus();
  if (!status.running) {
    console.log('\n⚠️  Please install and start Ollama first!');
    console.log('📝 Recommendations:');
    status.recommendations.forEach(rec => console.log(`   - ${rec}`));
    return;
  }
  
  // Show AI system status
  console.log('\n📊 AI System Status:');
  const aiStatus = getAISystemStatus();
  console.log(JSON.stringify(aiStatus, null, 2));
  
  // Test different safety levels
  const testPrompts = [
    'Hello! How does the Solidarity Platform work?',
    'Explain quantum coherence in simple terms',
    'Help me understand bridging mathematics'
  ];
  
  const safetyLevels = [0.03, 0.25, 0.618, 0.85, 0.97]; // Test various safety levels
  
  console.log('\n🧪 Testing Multiple Safety Levels:');
  for (const level of safetyLevels) {
    setAISafetyLevel(level);
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🛡️ Testing Safety Level: ${level}`);
    
    const result = await queryOllama(testPrompts[0]);
    if (result.success) {
      console.log(`✅ Response: ${result.content.substring(0, 100)}...`);
      console.log(`📊 Tokens: ${result.tokensUsed}, Mode: ${result.safetyMode}`);
      console.log(`🌟 Base Ratio: ${result.baseRatio}`);
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
  }
  
  // Test Solidarity context processing
  console.log('\n🎯 Testing Solidarity Context Processing:');
  setAISafetyLevel(0.618);
  const contextResult = await processWithSolidarityContext(
    'What is the base ratio?',
    {
      quantumCoherence: 0.618,
      bridgingMode: 'enhanced',
      safetyLevel: 0.618
    }
  );
  
  if (contextResult.success) {
    console.log('✅ Context-aware response received');
    console.log(`📝 ${contextResult.content.substring(0, 150)}...`);
  }
  
  // Test emergency stabilization
  console.log('\n🚨 Testing Emergency Stabilization:');
  setAISafetyLevel(0.97); // Set to critical level
  emergencyAIStabilization('Demo test - restoring bridging baseline');
  
  console.log('\n✅ Demo Complete!');
  console.log('='.repeat(60));
}

// Auto-run demo if called directly
if (require.main === module) {
  demo().catch(console.error);
}
