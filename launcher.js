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

class SolidarityPlatformLauncher {
    constructor() {
        this.version = '6.5.0';
        this.architect = 'Scott Charles Olson (Charly)';
        this.platform = 'Soul.Ed.Xchange.Fi';
        this.location = 'Kansas, USA 66210';
        
        // 🛡️ Bridging Safety System Integration
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
        
        this.systemStatus = 'INITIALIZING';
        this.components = new Map();
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

            // Run discovery scan
            console.log('\n🔍 Running Comprehensive Discovery...');
            const discoveryResults = await this.discovery.scanAllLocations();
            this.components.set('discovery', discoveryResults);

            // Detect mobile devices
            console.log('\n📱 Detecting Mobile Devices...');
            await this.mobileManager.detectMobileDevices();
            this.components.set('mobile_manager', true);

            // System status
            const allComponentsReady = Array.from(this.components.values()).every(status => status);
            this.systemStatus = allComponentsReady ? 'OPERATIONAL' : 'LIMITED_FUNCTIONALITY';

            console.log(`\n✅ Solidarity Platform Status: ${this.systemStatus}`);
            
            if (this.systemStatus === 'OPERATIONAL') {
                await this.runDemo();
            }

            return this.systemStatus;

        } catch (error) {
            console.error(`❌ Initialization error: ${error.message}`);
            this.systemStatus = 'ERROR';
            return this.systemStatus;
        }
    }

    async runDemo() {
        console.log('\n🎭 Running Solidarity Demo...');
        
        const phrases = [
            'Angel / Daemon Archetypes',
            'Hiccup Notifier',
            'Water reacting to gusts',
            'Too fours'
        ];

        for (const phrase of phrases) {
            console.log(`\n--- Processing: "${phrase}" ---`);
            const result = this.bridgingParser.parsePhrase(phrase);
            if (result) {
                console.log(`✅ Processed successfully for node ${result.node}`);
            }
            await this.delay(1000);
        }
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
            mobileDevices: this.mobileManager.getMobileStatus()
        };

        console.log('\n📊 System Report Generated');
        return report;
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
        
    } else {
        console.log('Usage:');
        console.log('  node launcher.js start    - Initialize all systems');
        console.log('  node launcher.js demo     - Run bridging phrase demo');
        console.log('  node launcher.js report   - Generate system report');
    }

}

module.exports = { SolidarityPlatformLauncher };

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Launcher error:', error.message);
        process.exit(1);
    });
}