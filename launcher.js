#!/usr/bin/env node

/**
 * Solidarity Platform Main Launcher
 * Orchestrates all Solidarity Framework components
 * 
 * @author Scott Charles Olson (CharlyOlson)
 * @platform Soul.Ed.Xchange.Fi
 * @version 6.5.0
 */

const { ComprehensiveSolidarityDiscovery } = require('./src/ComprehensiveSolidarityDiscovery');
const { EnhancedBridgingPhraseParser } = require('./src/EnhancedBridgingPhraseParser');
const { MobileDeviceManager } = require('./src/MobileDeviceManager');
const { SacredNumericSequence } = require('./src/SacredNumericSequence');
const { TIMBRCompressionSystem } = require('./src/TIMBRCompressionSystem');
const { QuantumEngine } = require('./src/QuantumEngine');
const { CorrectedSolidaritySystem } = require('./src/correctedSolidaritySystem');

class SolidarityPlatformLauncher {
    constructor() {
        this.version = '6.5.0';
        this.architect = 'Scott Charles Olson (Charly)';
        this.platform = 'Soul.Ed.Xchange.Fi';
        this.location = 'Kansas, USA 66210';

        // 🛡️ Harmonious Safety System Integration
        this.safetyLevel = 0.618; // Anchor Ratio - optimal starting point
        this.safetyThresholds = {
            CRITICAL_EMERGENCY: { min: 0.00, max: 0.05 },
            WARNING_LEVEL: { min: 0.05, max: 0.15 },
            CAUTION_RANGE: { min: 0.15, max: 0.25 },
            OPTIMAL_RANGE: { min: 0.25, max: 0.75 },
            UPPER_CAUTION: { min: 0.75, max: 0.85 },
            UPPER_WARNING: { min: 0.85, max: 0.95 },
            CRITICAL_UPPER: { min: 0.95, max: 1.00 }
        };

        this.discovery = new ComprehensiveSolidarityDiscovery();
        this.bridgingParser = new EnhancedBridgingPhraseParser();
        this.mobileManager = new MobileDeviceManager();
        this.sacredSequence = new SacredNumericSequence();
        this.timbrCompression = new TIMBRCompressionSystem({
            compressionLevel: 7, // Solidarity node 7
            useOmegaLock: true
        });

        // Initialize Quantum Cubic Calculation System
        this.quantumSystem = new CorrectedSolidaritySystem({
            cubicPrecision: 64,
            quantumDepth: 14,
            cubitBase: 697,
            quantumRecursionLevels: 49
        });

        // Initialize real quantum engine (simulator-first)
        const quantumShots = Number(process.env.SOLIDARITY_QUANTUM_SHOTS) || 256;
        this.enableRealQuantum = process.env.SOLIDARITY_USE_REAL_QUANTUM === '1';
        this.userApprovedQuantum = process.env.SOLIDARITY_USER_APPROVED === '1';
        this.quantumEngine = new QuantumEngine({
            pythonPath: process.env.SOLIDARITY_PYTHON,
            shots: quantumShots
        });

        this.systemStatus = 'INITIALIZING';
        this.components = new Map();

        // === SESSION LOGGING AND PATHWAYS ===
        const fs = require('fs');
        const path = require('path');
        this.sessionId = Date.now();
        this.sessionLogPath = path.join(process.cwd(), 'logs', `session_${this.sessionId}.json`);
        this.sessionBinPath = path.join(process.cwd(), 'logs', `bin_${this.sessionId}.gz`);
        this.sessionHistory = [];
        this.sessionFocusLog = [];
        this.sessionIrrelevantBin = [];

        // Ensure logs directory exists
        try {
            fs.mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });
        } catch (e) {}

        // Load previous session history if available
        if (fs.existsSync(this.sessionLogPath)) {
            try {
                const prev = fs.readFileSync(this.sessionLogPath, 'utf8');
                this.sessionHistory = JSON.parse(prev).history || [];
            } catch (e) {
                this.sessionHistory = [];
            }
        }
    }
    // Add a session log entry (prompt/response)
    addSessionLogEntry(entry) {
        const fs = require('fs');
        this.sessionHistory.push(entry);
        fs.writeFileSync(this.sessionLogPath, JSON.stringify({ history: this.sessionHistory }, null, 2));
    }

    // Add to focus log (for session task tracking)
    addFocusLog(entry) {
        this.sessionFocusLog.push(entry);
    }

    // Add to irrelevant bin (compressed)
    addIrrelevantBin(data) {
        const zlib = require('zlib');
        this.sessionIrrelevantBin.push(data);
        const compressed = zlib.gzipSync(JSON.stringify(this.sessionIrrelevantBin));
        require('fs').writeFileSync(this.sessionBinPath, compressed);
    }

    // Retrieve session context for Ollama
    getSessionContext() {
        return {
            history: this.sessionHistory,
            focus: this.sessionFocusLog,
            bin: this.sessionIrrelevantBin
        };
    }

    async initialize() {
        console.log(`\n🚀 Solidarity Platform v${this.version}`);
        console.log(`👨‍💻 Architect: ${this.architect}`);
        console.log(`📍 Location: ${this.location}`);
        console.log(`🌐 Platform: ${this.platform}`);
        console.log('═'.repeat(60));

        try {
            // Initialize bridging phrase parser
            console.log('\n🎵 Initializing Bridging Phrase Parser...');
            const bridgingReady = await this.bridgingParser.initialize();
            this.components.set('bridging_parser', bridgingReady);
            
            // Initialize Sacred Numeric Sequence system
            console.log('\n🔢 Initializing Sacred Numeric Sequence System...');
            const sequenceReport = this.sacredSequence.generateSequenceReport();
            console.log(`   Phi value: ${this.sacredSequence.phi}`);
            console.log(`   Fibonacci anchor ratio approximation: ${sequenceReport.sequences.fibonacci.anchor_approximation}`);
            this.components.set('sacred_sequence', true);
            
            // Initialize Golden Ratio Mathematics
            console.log('\n🌟 Initializing Golden Ratio Mathematics...');
            console.log(`   φ (Phi): ${this.quantumSystem.goldenMath.PHI.toFixed(15)}`);
            console.log(`   φ reciprocal: ${this.quantumSystem.goldenMath.PHI_RECIPROCAL.toFixed(15)}`);
            console.log(`   Golden Angle: ${this.quantumSystem.goldenMath.GOLDEN_ANGLE_DEGREES.toFixed(6)}°`);
            console.log(`   Sacred Nodes: ${this.quantumSystem.goldenMath.SACRED_NODES.join(', ')}`);
            this.components.set('golden_ratio_math', true);
            
            // Initialize Harmonic Phrase Parser
            console.log('\n🎵 Initializing Harmonic Phrase Parser...');

            // ===============================
            // Solidarity Session Launcher
            // ===============================

            const fs = require('fs');
            const path = require('path');
            const zlib = require('zlib');
            let askOllama;

            // 1. Config loader (can be extended for settings menu)
            function loadConfig() {
                // In a real app, load from file or env
                return {
                    logsDir: path.join(__dirname, 'logs'),
                    useOllama: true,
                    logSessions: true,
                    maxContextTokens: 4000
                };
            }

            const CONFIG = loadConfig();

            // 2. Ensure logs directory exists
            function ensureLogsDir() {
                if (!fs.existsSync(CONFIG.logsDir)) {
                    fs.mkdirSync(CONFIG.logsDir, { recursive: true });
                }
            }

            // 3. Create a new session object
            function initSession() {
                ensureLogsDir();
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const sessionId = `session_${timestamp}`;
                const sessionLogPath = path.join(CONFIG.logsDir, `${sessionId}.json`);
                const binPath = path.join(CONFIG.logsDir, `${sessionId}_bin.gz`);

                const session = {
                    id: sessionId,
                    startedAt: new Date().toISOString(),
                    logPath: sessionLogPath,
                    binPath,
                    history: [],
                    focusLog: []
                };

                if (CONFIG.logSessions) {
                    fs.writeFileSync(sessionLogPath, JSON.stringify({ session, interactions: [] }, null, 2));
                }

                return session;
            }

            // 4. Load previous history (for context)
            function loadHistory(limit = 3) {
                ensureLogsDir();
                const files = fs.readdirSync(CONFIG.logsDir)
                    .filter(f => f.startsWith('session_') && f.endsWith('.json'))
                    .sort()
                    .slice(-limit);

                const historyChunks = [];
                for (const file of files) {
                    const fullPath = path.join(CONFIG.logsDir, file);
                    try {
                        const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                        const interactions = content.interactions || [];
                        historyChunks.push(...interactions);
                    } catch (e) {
                        console.warn('Could not parse history file:', file, e.message);
                    }
                }
                return historyChunks;
            }

            // 5. Initialize Ollama client (require only if needed)
            function initOllamaClient() {
                if (!askOllama) {
                    askOllama = require('./ai_integration/ollama_integration').queryOllama;
                }
                return askOllama;
            }

            // 6. Log a single interaction
            function logInteraction(session, prompt, response, meta = {}) {
                if (!CONFIG.logSessions) return;
                let currentLog;
                try {
                    currentLog = JSON.parse(fs.readFileSync(session.logPath, 'utf8'));
                } catch {
                    currentLog = { session, interactions: [] };
                }
                const entry = {
                    timestamp: new Date().toISOString(),
                    prompt,
                    response,
                    meta
                };
                currentLog.interactions.push(entry);
                fs.writeFileSync(session.logPath, JSON.stringify(currentLog, null, 2));
                session.history.push(entry);
            }

            // 7. Push “irrelevant” data into compressed bin
            function pushToBin(session, dataChunk) {
                const serialized = typeof dataChunk === 'string' ? dataChunk : JSON.stringify(dataChunk);
                const gz = zlib.gzipSync(serialized);
                fs.appendFileSync(session.binPath, gz);
            }

            // 8. Build context for Ollama from history
            function buildContext(history) {
                const recent = history.slice(-20);
                const contextLines = [];
                for (const h of recent) {
                    contextLines.push(`User: ${h.prompt}`);
                    contextLines.push(`Assistant: ${h.response}`);
                }
                return contextLines.join('\n');
            }

            // 9. Main session loop (for CLI or UI)
            async function startSession(initialPrompt) {
                const session = initSession();
                const pastInteractions = loadHistory();
                const context = buildContext(pastInteractions);
                session.focusLog.push({
                    startedAt: new Date().toISOString(),
                    description: 'Ollama conversation with Solidarity logging'
                });
                const userPrompt = initialPrompt || 'Hello, world!';
                let answer;
                if (CONFIG.useOllama) {
                    const ollama = initOllamaClient();
                    const result = await ollama(userPrompt, { context });
                    answer = result && result.content ? result.content : String(result);
                } else {
                    answer = 'Ollama disabled in settings.';
                }
                const meta = { engine: 'ollama', relevant: true };
                logInteraction(session, userPrompt, answer, meta);
                if (pastInteractions.length > 50) {
                    const oldStuff = pastInteractions.slice(0, pastInteractions.length - 50);
                    pushToBin(session, oldStuff);
                }
                return { session, answer };
            }

            module.exports = {
                loadConfig,
                initSession,
                loadHistory,
                initOllamaClient,
                logInteraction,
                pushToBin,
                startSession
            };
            console.log(`   Cubit Calc: ${result.cubitCalculation.toFixed(2)}`);
        }
        
        // Display quantum system status
        console.log('\n⚡ Quantum System Status:');
        const status = this.quantumSystem.getQuantumSystemStatus();
        console.log(`   Quantum Engine: ${status.quantum_engine_status}`);
        console.log(`   Cubic Calculator: ${status.cubic_calculation_status}`);
        console.log(`   Current Coherence: ${status.quantum_coherence}`);
        console.log(`   Big Ask Threshold: ${status.big_ask_threshold}`);
        console.log(`   Cubit Capacity: ${status.cubitCalculationCapacity}`);
    }
    
    async processBigAsk(question, complexity = 7) {
        console.log('\n🚀 Processing Big Ask Quantum Question');
        console.log('═'.repeat(50));
        
        const result = this.quantumSystem.processBigAskQuestion(question, complexity);
        
        console.log(`Question: ${result.question}`);
        console.log(`Complexity Level: ${result.complexity}/49`);
        console.log(`Quantum Scaling Factor: ${result.quantumFactor.toFixed(6)}`);
        console.log(`Cubic Dimensions:`);
        console.log(`  X: ${result.cubicDimensions.x.toFixed(4)}`);
        console.log(`  Y: ${result.cubicDimensions.y.toFixed(4)}`);
        console.log(`  Z: ${result.cubicDimensions.z.toFixed(4)}`);
        console.log(`  Volume: ${result.cubicDimensions.volume.toFixed(4)} cubic units`);
        console.log(`  Surface: ${result.cubicDimensions.surface.toFixed(4)} square units`);
        console.log(`Quantum Coherence: ${result.coherenceLevel.toFixed(4)}`);
        console.log(`Scaling Depth: ${result.scalingDepth} levels`);
        console.log(`Cubit Calculation: ${result.cubitCalculation.toFixed(2)}`);
        
        if (complexity > 35) {
            console.log('\n⚠️  High complexity detected - quantum recursion activated');
        }
        
        return result;
    }
    
    async calculateQuantumCubic(value, depth = 14) {
        console.log('\n📐 Quantum Cubic Root Calculation');
        console.log('═'.repeat(40));
        
        const result = this.quantumSystem.calculateQuantumCubicRoot(value, depth);
        
        console.log(`Input Value: ${value}`);
        console.log(`Quantum Depth: ${depth}/49`);
        console.log(`Standard Cubic Root: ${Math.cbrt(value).toFixed(6)}`);
        console.log(`Quantum Scaled Result: ${result.toFixed(6)}`);
        console.log(`Anchor Ratio Factor: ${Math.pow(1.618033988749, depth/49).toFixed(6)}`);
        console.log(`Cubit Scaling: ${(697/697).toFixed(6)}`);
        
        return result;
    }

    generateSystemReport() {
        const report = {
            timestamp: new Date().toISOString(),
            version: this.version,
            architect: this.architect,
            platform: this.platform,
            location: this.location,
            systemStatus: this.systemStatus,
            components: Object.fromEntries(this.components),
            discovery: this.discovery.generateDiscoveryReport(),
            mobileDevices: this.mobileManager.getMobileStatus(),
            sacred_sequence: {
                phi: this.sacredSequence.phi,
                base_frequency: this.sacredSequence.baseFrequency,
                sequences_available: Array.from(this.sacredSequence.sequences.keys()),
                sequence_report: this.sacredSequence.generateSequenceReport()
            },
            timbr_compression: {
                metrics: this.timbrCompression.getCompressionMetrics(),
                compression_level: this.timbrCompression.config.compressionLevel,
                omega_lock_enabled: this.timbrCompression.config.useOmegaLock
            }
        };

        console.log('\n📊 System Report Generated');
        return report;
    }

    // 🛡️ Bridging Safety Methods
    assessSystemSafety() {
        const level = this.safetyLevel;
        
        if (level >= this.safetyThresholds.CRITICAL_EMERGENCY.min && level <= this.safetyThresholds.CRITICAL_EMERGENCY.max) {
            return { level: 'CRITICAL_EMERGENCY', mode: 'minimal_boot', components: ['core'], performance: 0.05 };
        }
        if (level >= this.safetyThresholds.WARNING_LEVEL.min && level <= this.safetyThresholds.WARNING_LEVEL.max) {
            return { level: 'WARNING_LEVEL', mode: 'limited_loading', components: ['core', 'basic'], performance: 0.15 };
        }
        if (level >= this.safetyThresholds.CAUTION_RANGE.min && level <= this.safetyThresholds.CAUTION_RANGE.max) {
            return { level: 'CAUTION_RANGE', mode: 'sequential_init', components: ['core', 'basic', 'standard'], performance: 0.25 };
        }
        if (level >= this.safetyThresholds.OPTIMAL_RANGE.min && level <= this.safetyThresholds.OPTIMAL_RANGE.max) {
            return { level: 'OPTIMAL_RANGE', mode: 'full_power', components: ['all'], performance: 0.75 };
        }
        if (level >= this.safetyThresholds.UPPER_CAUTION.min && level <= this.safetyThresholds.UPPER_CAUTION.max) {
            return { level: 'UPPER_CAUTION', mode: 'performance_monitoring', components: ['all'], performance: 0.85 };
        }
        if (level >= this.safetyThresholds.UPPER_WARNING.min && level <= this.safetyThresholds.UPPER_WARNING.max) {
            return { level: 'UPPER_WARNING', mode: 'load_balancing', components: ['all_limited'], performance: 0.95 };
        }
        if (level >= this.safetyThresholds.CRITICAL_UPPER.min && level <= this.safetyThresholds.CRITICAL_UPPER.max) {
            return { level: 'CRITICAL_UPPER', mode: 'emergency_distribution', components: ['essential'], performance: 1.00 };
        }
    }

    setSafetyLevel(newLevel) {
        // Ensure safety level stays within bounds
        this.safetyLevel = Math.max(0.00, Math.min(1.00, newLevel));
        const assessment = this.assessSystemSafety();
        console.log(`🛡️ Safety Level Set: ${this.safetyLevel.toFixed(3)} - ${assessment.level}`);
        return assessment;
    }

    bridgeWithQuantumCoherence(quantumCoherence) {
        // Match launcher safety with quantum coherence levels
        this.setSafetyLevel(quantumCoherence);
        console.log(`🔄 Launcher bridged with quantum coherence: ${quantumCoherence.toFixed(3)}`);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Main execution
async function main() {
    const launcher = new SolidarityPlatformLauncher();
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === 'start') {
        await launcher.initialize();
        
    } else if (args[0] === 'report') {
        await launcher.initialize();
        const report = launcher.generateSystemReport();
        
        const reportPath = require('path').join(process.cwd(), 'solidarity-system-report.json');
        require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`💾 System report saved: ${reportPath}`);
        
    } else if (args[0] === 'demo') {
        await launcher.initialize();
        if (launcher.systemStatus === 'OPERATIONAL') {
            await launcher.runDemo();
        }
        
    } else if (args[0] === 'quantum') {
        await launcher.initialize();
        if (launcher.systemStatus === 'OPERATIONAL') {
            await launcher.runQuantumDemo();
        }
        
    } else if (args[0] === 'bigask' && args[1]) {
        await launcher.initialize();
        const question = args.slice(1).join(' ');
        const complexity = args.length > 3 ? parseInt(args[args.length - 1]) || 7 : 7;
        await launcher.processBigAsk(question, complexity);
        
    } else if (args[0] === 'cubic' && args[1]) {
        await launcher.initialize();
        const value = parseFloat(args[1]);
        const depth = args[2] ? parseInt(args[2]) : 14;
        await launcher.calculateQuantumCubic(value, depth);
        
    } else if (args[0] === 'core-engine') {
        console.log('🧮 Running Core Mathematics Engine Demo...\n');
        require('./core_engine_demo.js');
        
    } else {
        console.log('Usage:');
        console.log('  node launcher.js start              - Initialize all systems');
        console.log('  node launcher.js demo               - Run bridging phrase demo');
        console.log('  node launcher.js quantum            - Run quantum cubic calculation demo');
        console.log('  node launcher.js bigask [question]  - Process big ask quantum question');
        console.log('  node launcher.js cubic [value] [depth] - Calculate quantum cubic root');
        console.log('  node launcher.js core-engine        - Run Core Mathematics Engine demo');
        console.log('  node launcher.js report             - Generate system report');
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SolidarityPlatformLauncher };
}

// Auto-run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Launcher error:', error.message);
        process.exit(1);
    });
}