/**
 * Focused Pass Correction System for Solidarity Platform
 * Implements multi-level text correction: Symbol → Word → Line
 * Integrates with harmonic phrase vocabulary
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

class FocusedPassCorrector {
    constructor() {
        this.correctionUnits = ["symbol", "word", "line"];
        this.correctionHistory = [];
        
        // Error pattern matchers
        this.errorPatterns = new Map([
            ["symbol", /[^\w\s\.\,\;\:\!\?\-\'\"]/g],  // Invalid symbols
            ["word", /\b\w{1,2}\b/g],                   // Very short words (potential errors)
            ["line", /^.{1,10}$/gm]                     // Very short lines (potential fragments)
        ]);
        
        this.harmonicCorrections = new Map();
        
        // Statistics
        this.stats = {
            symbolCorrections: 0,
            wordCorrections: 0,
            lineCorrections: 0,
            totalPasses: 0,
            harmonicPhrasesRecovered: 0
        };
    }

    /**
     * Symbol-level correction
     * Replaces invalid/problematic characters with harmonic equivalents
     */
    correctSymbol(symbol) {
        const symbolMap = {
            '�': '♪',      // Musical note (harmonic replacement)
            '©': '♫',
            '®': '♬',
            '™': '♭',
            '†': '♯',
            '\x00': '',     // Remove null characters
            '\uFFFD': '♪',  // Replace replacement characters
            '\r': '\n',     // Normalize line endings
            '\t': '    '    // Normalize tabs to spaces
        };
        
        const corrected = symbolMap[symbol] || symbol;
        if (corrected !== symbol) {
            this.stats.symbolCorrections++;
        }
        return corrected;
    }

    /**
     * Word-level correction with harmonic phrase vocabulary
     * Fixes common typos and ensures harmonic phrase components are correct
     */
    correctWord(word) {
        const harmonicWords = {
            // Common typos
            'teh': 'the',
            'adn': 'and',
            'thier': 'their',
            'recieve': 'receive',
            'seperate': 'separate',
            'occured': 'occurred',
            'smple': 'simple',
            'txt': 'text',
            'erors': 'errors',
            'tim': 'time',
            
            // Harmonic phrase corrections (case-insensitive matching)
            'fourrs': 'fours',
            'fours': 'fours',           // "Too fours"
            'cents': 'Cents',           // "Hard time making Cents"
            'hiccup': 'Hiccup',         // "Hiccup Notifier"
            'notifer': 'Notifier',
            'notifier': 'Notifier',
            'telephon': 'Telephone',    // "Telephone password carousel"
            'telephone': 'Telephone',
            'carousl': 'carousel',
            'carosel': 'carousel',
            'angel': 'Angel',           // "Angel / Daemon Archetypes"
            'daemon': 'Daemon',
            'demon': 'Daemon',          // Common alternate spelling
            'archetpes': 'Archetypes',
            'archetypes': 'Archetypes',
            'reacting': 'reacting',     // "Water reacting to gusts"
            'gusts': 'gusts'
        };
        
        const cleaned = word.toLowerCase().replace(/[^\w]/g, '');
        const corrected = harmonicWords[cleaned] || word;
        
        if (corrected !== word) {
            this.stats.wordCorrections++;
        }
        
        return corrected;
    }

    /**
     * Line-level correction for harmonic phrases
     * Recognizes and normalizes complete harmonic phrase patterns
     */
    correctLine(line) {
        if (!line || line.trim().length === 0) return line;
        
        let correctedLine = line;
        const originalLine = line;
        
        // Known harmonic phrases with common variations
        const harmonicPhrases = [
            { 
                canonical: "Too fours", 
                variations: ["too fours", "2 fours", "to fours", "too 4s", "two fours"],
                trigger: "ephemeral_bridge"
            },
            { 
                canonical: "Hard time making Cents", 
                variations: ["hard time making cents", "hard time making sense", "hard time making ¢"],
                trigger: "value_misalignment"
            },
            { 
                canonical: "Hiccup Notifier", 
                variations: ["hiccup notifier", "hiccup notifer", "hickup notifier"],
                trigger: "instability_marker"
            },
            { 
                canonical: "Telephone password carousel", 
                variations: ["telephone password carosel", "phone password carousel", "telephone passwd carousel"],
                trigger: "identity_collapse"
            },
            { 
                canonical: "Water reacting to gusts", 
                variations: ["water reacting to gust", "water reacts to gusts", "water reacting 2 gusts"],
                trigger: "multi_variable_mod"
            },
            { 
                canonical: "Angel / Daemon Archetypes", 
                variations: ["angel/daemon archetypes", "angel daemon archetypes", "angel / demon archetypes"],
                trigger: "force_balance"
            }
        ];
        
        // Check each harmonic phrase for matches
        for (const phrase of harmonicPhrases) {
            const lowerLine = correctedLine.toLowerCase();
            
            // Check if line contains any variation
            for (const variation of phrase.variations) {
                if (lowerLine.includes(variation.toLowerCase())) {
                    // Replace with canonical form
                    const regex = new RegExp(variation, 'gi');
                    correctedLine = correctedLine.replace(regex, phrase.canonical);
                    this.stats.lineCorrections++;
                    this.stats.harmonicPhrasesRecovered++;
                    
                    // Store the correction
                    this.harmonicCorrections.set(originalLine, {
                        corrected: correctedLine,
                        phrase: phrase.canonical,
                        trigger: phrase.trigger,
                        timestamp: Date.now()
                    });
                    
                    break;
                }
            }
        }
        
        return correctedLine;
    }

    /**
     * Perform focused pass at specified unit level
     * @param {string} text - Input text to correct
     * @param {string} unit - "symbol", "word", or "line"
     * @returns {string} - Corrected text
     */
    focusedPass(text, unit = "line") {
        if (!this.correctionUnits.includes(unit)) {
            throw new Error(`Invalid correction unit: ${unit}. Must be one of: ${this.correctionUnits.join(', ')}`);
        }

        let corrected = text;

        switch(unit) {
            case "symbol":
                corrected = text.split('').map(char => this.correctSymbol(char)).join('');
                break;
                
            case "word":
                corrected = text.split(/\s+/).map(word => this.correctWord(word)).join(' ');
                break;
                
            case "line":
                corrected = text.split('\n').map(line => this.correctLine(line)).join('\n');
                break;
        }

        // Store in history
        this.correctionHistory.push({
            original: text,
            corrected: corrected,
            unit: unit,
            changed: text !== corrected,
            timestamp: Date.now()
        });

        return corrected;
    }

    /**
     * Multi-pass correction: Symbol → Word → Line
     * Performs iterative correction at all levels
     */
    multiPassCorrection(text, passes = 1) {
        let corrected = text;
        const history = [text];

        for (let pass = 0; pass < passes; pass++) {
            // Symbol level
            corrected = this.focusedPass(corrected, "symbol");
            
            // Word level
            corrected = this.focusedPass(corrected, "word");
            
            // Line level
            corrected = this.focusedPass(corrected, "line");
            
            history.push(corrected);
            this.stats.totalPasses++;
        }

        return {
            original: text,
            final: corrected,
            passes: passes,
            history: history,
            statistics: { ...this.stats }
        };
    }

    /**
     * Get statistics about corrections performed
     */
    getStatistics() {
        return {
            ...this.stats,
            historyLength: this.correctionHistory.length,
            harmonicCorrections: this.harmonicCorrections.size
        };
    }

    /**
     * Get harmonic phrase corrections that were made
     */
    getHarmonicCorrections() {
        return Array.from(this.harmonicCorrections.entries()).map(([original, data]) => ({
            original,
            ...data
        }));
    }

    /**
     * Reset statistics
     */
    resetStatistics() {
        this.stats = {
            symbolCorrections: 0,
            wordCorrections: 0,
            lineCorrections: 0,
            totalPasses: 0,
            harmonicPhrasesRecovered: 0
        };
        this.correctionHistory = [];
    }
}

module.exports = { FocusedPassCorrector };
