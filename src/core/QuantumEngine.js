/*
 * SOLIDARITY PLATFORM - QUANTUM ENGINE WRAPPER
 * ============================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class QuantumEngine {
    constructor(options = {}) {
        this.enginePath = options.enginePath || path.join(__dirname, '..', 'quantum', 'engine.py');
        this.defaultShots = options.shots || 256;
        this.pythonPath = this.resolvePython(options.pythonPath);
    }

    resolvePython(explicitPath) {
        if (explicitPath) return explicitPath;
        if (process.env.SOLIDARITY_PYTHON) return process.env.SOLIDARITY_PYTHON;

        const repoRoot = path.join(__dirname, '..');
        const venvWindows = path.join(repoRoot, '.venv', 'Scripts', 'python.exe');
        const venvPosix = path.join(repoRoot, '.venv', 'bin', 'python3');

        if (fs.existsSync(venvWindows)) return venvWindows;
        if (fs.existsSync(venvPosix)) return venvPosix;

        return 'python3';
    }

    runExperiment(experiment = 'bell', shots = this.defaultShots) {
        const args = [this.enginePath, experiment, '--shots', String(shots)];
        const result = spawnSync(this.pythonPath, args, { encoding: 'utf8' });

        if (result.error) {
            throw new Error(`Quantum engine invocation failed: ${result.error.message}`);
        }

        if (result.status !== 0) {
            throw new Error(`Quantum engine exited with ${result.status}: ${result.stderr || 'no stderr'}`);
        }

        try {
            return JSON.parse(result.stdout.trim());
        } catch (err) {
            throw new Error(`Unable to parse quantum engine output: ${err.message}\nRaw: ${result.stdout}`);
        }
    }
}

module.exports = { QuantumEngine };
