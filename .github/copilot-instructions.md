# Solidarity Platform - AI Coding Agent Instructions

## Project Overview

The **Solidarity Platform** is a quantum-coherent computational framework implementing the **Henry 7 Step 14 Trott Waltz numerological system**. This is a hybrid JavaScript/Python codebase integrating bridging anchor DSP processing, local AI (Ollama), blockchain/financial systems, and software-based quantum computing (no hardware qubits needed).

**Key Insight**: This platform achieves "quantum-coherent" behavior through mathematical software patterns (φ-based ratios, sacred numeric sequences, 49-level recursion) rather than physical quantum hardware.

## Architecture & Core Concepts

### Mathematical Foundation - The Golden Ratio (φ = 1.618)
- **Base Ratio**: φ = 1.618033988749 is the foundation for all calculations
- **Bridging Baseline**: 0.618 (reciprocal of φ) used for stability and signal processing
- **Sacred Progression**: 7 → 14 → 49 (Henry framework: base → double → square)
- **Control Ratio**: 3.5 (49÷14) for scaling operations
- **Quantum Coherence Anchor**: 0.618 is the default safety/coherence level throughout

### Key Components
```
correctedSolidaritySystem.js    # Main orchestrator, quantum system integration
launcher.js                      # Platform entry point, initializes all subsystems
bridging_anchor_systems/         # Python DSP processing (NumPy-based)
├── bridging_anchor_processor.py # Core signal processing with φ-based transforms
ai_integration/                  # Local Ollama AI with safety coordination
├── ollama_integration.js        # Zero-cost AI, safety-aware responses
financial_systems/               # Blockchain connectors, smart contracts
```

### Multi-Language Integration Pattern
- **JavaScript**: Orchestration, API servers, system coordination, quantum cubic calculations
- **Python**: Scientific DSP processing (NumPy), bridging anchor algorithms, mathematical precision
- **Pattern**: JS calls Python scripts via child processes for heavy numerical computations

## Critical Safety System

### 7-Tier Safety Thresholds (0.0-1.0 scale)
All systems (quantum, AI, bridging, financial) implement these coordinated safety levels:

```javascript
CRITICAL_EMERGENCY: 0.00-0.05  // Emergency mode, essential operations only
WARNING_LEVEL:      0.05-0.15  // Conservative mode
CAUTION_RANGE:      0.15-0.25  // Standard operation
OPTIMAL_RANGE:      0.25-0.75  // Full capabilities (includes 0.618 anchor)
UPPER_CAUTION:      0.75-0.85  // Performance monitoring
UPPER_WARNING:      0.85-0.95  // Rate limiting active
CRITICAL_UPPER:     0.95-1.00  // Emergency fallback
```

**When adding features**: Always integrate with the safety system. Check `safetyLevel` or `bridgingSafetyLevel` properties and adjust behavior across thresholds. Default to 0.618 for optimal anchoring.

## Development Workflows

### Primary Commands (package.json)
```powershell
npm start              # Start API server (src/api/server.js)
npm test               # Jest test suite
npm run test:bridging  # Python DSP demo (bridging_anchor_processor.py)
npm run quantum:demo   # Quantum system demonstration

# Quantum system testing
node launcher.js quantum        # Full quantum demo
node launcher.js cubic          # Quantum cubic calculations
node launcher.js bigask         # Big Ask question processing (complexity 1-49)
```

### Python Integration
```powershell
# Test bridging anchor system
python3 bridging_anchor_systems/bridging_anchor_processor.py

# Advanced test suite
python3 bridging_anchor_systems/bridging_anchor_test_suite.py
```

### Common Entry Points
- `launcher.js` - Initialize platform, run discovery, start quantum systems
- `correctedSolidaritySystem.js` - Main system class for quantum/bridging operations
- `ai_integration/ollama_integration.js` - Local AI queries with safety controls

## Code Patterns & Conventions

### 1. Safety-Aware Class Initialization
```javascript
class MySystem {
  constructor(config = {}) {
    // Always include safety baseline
    this.safetyLevel = config.safetyLevel || 0.618;
    this.baseRatio = 1.618;
    this.bridgingBaseline = 0.618;
    
    // Define safety thresholds matching the 7-tier system
    this.safetyThresholds = {
      CRITICAL_EMERGENCY: { min: 0.00, max: 0.05 },
      // ... (see safety section above)
      OPTIMAL_RANGE: { min: 0.25, max: 0.75 }
    };
  }
}
```

### 2. Trademark Header (required in new files)
All files include this exact header format:
```javascript
/*
 * SOLIDARITY PLATFORM - [MODULE NAME]
 * ===================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */
```

### 3. Sacred Numeric Sequences
When implementing numeric patterns, respect these sequences:
- **Fibonacci**: 1, 1, 2, 3, 5, 8, 13, 21... (golden ratio approximation)
- **Solidarity Nodes**: 1, 3, 4, 7, 14, 21 (system architecture nodes)
- **Henry Progression**: 7 → 14 → 49 (base → double → square)

### 4. AI Integration Pattern (Ollama)
```javascript
const { queryOllama, assessAISafety } = require('./ai_integration/ollama_integration.js');

// Query with safety context
const result = await queryOllama('Your query', {
  safetyLevel: 0.618,        // Golden ratio baseline
  model: 'llama3.2:3b',      // Default model for optimal range
  temperature: 0.4           // Matches OPTIMAL_RANGE configuration
});
```

### 5. Python DSP Integration
```javascript
const { spawn } = require('child_process');

const python = spawn('python3', [
  'bridging_anchor_systems/bridging_anchor_processor.py',
  '--node', '7',
  '--intensity', '1.0'
]);
```

### 6. Quantum System Operations
```javascript
const { CorrectedSolidaritySystem } = require('./correctedSolidaritySystem.js');
const system = new CorrectedSolidaritySystem({
  cubicPrecision: 64,
  quantumDepth: 14,
  quantumRecursionLevels: 49
});

// Process with quantum awareness
const result = system.processBigAskQuestion('Complex query', 21); // complexity 1-49
```

## Financial/Blockchain Specifics

- **Default Mode**: `testMode: true` (always start in test mode for safety)
- **Multi-chain Support**: Ethereum, Solana (see `financial_systems/blockchain_connector.js`)
- **φ-based Portfolio Optimization**: Financial calculations use golden ratio for rebalancing
- **Smart Contracts**: Located in `financial_systems/smart_contract_manager.js`

## Testing Approach

- **JavaScript**: Jest tests in `tests/` directory (unit, integration, e2e)
- **Python**: Self-contained test suites (`bridging_anchor_test_suite.py`)
- **Mathematical Validation**: Tests verify φ-ratio calculations, sacred sequence accuracy
- **Safety System Tests**: Validate behavior across all 7 safety thresholds

## Configuration Files

- `PROJECT_CONFIG.json` - Owner/trademark metadata
- `config/system_config.js` - Unified system configuration
- `config/financial_config.json` - Financial parameters
- `ai_integration/ai_config.json` - AI model settings
- `bridging_anchor_systems/bridging_anchor_config.json` - DSP settings

## Common Pitfalls

1. **Don't hardcode safety levels** - Always parameterize and default to 0.618
2. **Respect the φ ratio** - Use `1.618` for base ratio, `0.618` for baseline (not arbitrary decimals)
3. **Python paths** - Use `python3` not `python` (cross-platform compatibility)
4. **Node system** - Valid nodes are 1, 3, 4, 7, 14, 21 (not arbitrary numbers)
5. **Test mode** - Financial/blockchain operations must start with `testMode: true`

## When Adding Features

1. **Safety Integration**: Define behavior for each of the 7 safety tiers
2. **φ-Ratio Alignment**: Incorporate golden ratio calculations where mathematically appropriate
3. **Trademark Header**: Add standard header to all new files
4. **Cross-Language**: Consider if Python (NumPy) better suited for numerical heavy lifting
5. **Quantum Coherence**: If processing data, respect `quantumCoherence` state (typically 0.618)
6. **Documentation**: Update `COMPLETE_SYSTEM_DOCUMENTATION.md` for major features

## Key Files to Reference

- `COMPLETE_SYSTEM_DOCUMENTATION.md` - Comprehensive system reference (919 lines)
- `README.md` - Quick start and architecture overview
- `AI_FINANCIAL_SYSTEMS_README.md` - AI/financial integration guide
- `launcher.js` - Platform initialization patterns
- `correctedSolidaritySystem.js` - Core system class implementation
- `bridging_anchor_systems/README.md` - DSP processing guide
