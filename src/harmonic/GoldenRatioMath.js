/**
 * Golden Ratio Mathematical Foundation for Solidarity Platform
 * Implements φ-based calculations, Fibonacci sequences, and mirror repunits
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

class GoldenRatioMath {
    constructor() {
        // Golden ratio constants
        this.PHI = (1 + Math.sqrt(5)) / 2;              // φ = 1.618033988749895
        this.PHI_CONJUGATE = (1 - Math.sqrt(5)) / 2;    // -0.618033988749895
        this.PHI_SQUARED = this.PHI * this.PHI;          // φ² = φ + 1 = 2.618033988749895
        this.PHI_RECIPROCAL = 1 / this.PHI;              // 1/φ = φ - 1 = 0.618033988749895
        this.GOLDEN_ANGLE = 2 * Math.PI / (this.PHI_SQUARED);  // 137.507764...° in radians
        this.GOLDEN_ANGLE_DEGREES = this.GOLDEN_ANGLE * 180 / Math.PI;  // 137.507764...°
        
        // Henry 7 Step 14 Trott Waltz framework
        this.HENRY_BASE = 7;
        this.HENRY_DOUBLE = 14;
        this.HENRY_SQUARE = 49;
        this.CONTROL_RATIO = this.HENRY_SQUARE / this.HENRY_DOUBLE;  // 3.5
        
        // Sacred node sequence
        this.SACRED_NODES = [1, 3, 4, 7, 14, 21, 49];
        
        this.PRECISION = 15;  // Decimal places for calculations
    }

    /**
     * Calculate nth Fibonacci number using Binet's formula
     * F(n) = (φⁿ - ψⁿ) / √5, where ψ = -1/φ
     */
    fibonacci(n) {
        if (n === 0) return 0;
        if (n === 1) return 1;
        if (n < 0) throw new Error('Fibonacci only defined for non-negative integers');
        
        return Math.round(
            (Math.pow(this.PHI, n) - Math.pow(this.PHI_CONJUGATE, n)) / Math.sqrt(5)
        );
    }

    /**
     * Calculate nth Lucas number
     * L(n) = φⁿ + ψⁿ
     */
    lucas(n) {
        if (n === 0) return 2;
        if (n === 1) return 1;
        if (n < 0) throw new Error('Lucas only defined for non-negative integers');
        
        return Math.round(
            Math.pow(this.PHI, n) + Math.pow(this.PHI_CONJUGATE, n)
        );
    }

    /**
     * Generate Fibonacci sequence up to n terms
     */
    fibonacciSequence(count) {
        const sequence = [];
        for (let i = 0; i < count; i++) {
            sequence.push(this.fibonacci(i));
        }
        return sequence;
    }

    /**
     * Calculate golden ratio approximation from consecutive Fibonacci numbers
     * F(n+1) / F(n) → φ as n → ∞
     */
    fibonacciPhiApproximation(n) {
        const fn = this.fibonacci(n);
        const fn1 = this.fibonacci(n + 1);
        return fn1 / fn;
    }

    /**
     * Generate golden spiral coordinates in 3D space
     * Uses φ for radius scaling and golden angle for rotation
     */
    generateGoldenSpiral(turns = 5, pointsPerTurn = 20) {
        const coordinates = [];
        const totalPoints = turns * pointsPerTurn;
        const angleStep = this.GOLDEN_ANGLE / pointsPerTurn;
        
        for (let i = 0; i < totalPoints; i++) {
            const angle = i * angleStep;
            const radius = Math.pow(this.PHI, angle / (2 * Math.PI));
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const z = radius * Math.sin(angle * this.PHI_RECIPROCAL);
            
            coordinates.push({ 
                x, 
                y, 
                z, 
                angle: angle * 180 / Math.PI,  // degrees
                radius,
                index: i
            });
        }
        
        return coordinates;
    }

    /**
     * Calculate golden ratio-based time allocation
     * Uses logarithmic scaling with φ base
     */
    calculateGoldenTiming(dataSize, baseTime = 10, maxTime = 2000) {
        if (dataSize <= 0) return baseTime;
        
        const goldenScaling = Math.pow(this.PHI, Math.log(dataSize) / Math.log(this.PHI));
        return Math.min(maxTime, baseTime * goldenScaling);
    }

    /**
     * Apply golden ratio scaling to value
     * Useful for optimization calculations
     */
    scaleByPhi(value, reciprocal = false) {
        return reciprocal ? value * this.PHI_RECIPROCAL : value * this.PHI;
    }

    /**
     * Check if value is close to golden ratio (within tolerance)
     */
    isGoldenRatio(value, tolerance = 0.001) {
        return Math.abs(value - this.PHI) < tolerance;
    }

    /**
     * Find closest sacred node to given value
     */
    findClosestSacredNode(value) {
        let closest = this.SACRED_NODES[0];
        let minDiff = Math.abs(value - closest);
        
        for (const node of this.SACRED_NODES) {
            const diff = Math.abs(value - node);
            if (diff < minDiff) {
                minDiff = diff;
                closest = node;
            }
        }
        
        return { node: closest, difference: minDiff };
    }
}

/**
 * Mirror Number (Repunit) System
 * Implements repunits: 1, 11, 111, 1111, ...
 * R_n = (10^n - 1) / 9
 */
class MirrorNumberSystem {
    constructor() {
        this.generatedRepunits = new Map();
        this.squareRootCache = new Map();
        this.perfectSquareCache = new Map();
    }

    /**
     * Generate repunits (mirror numbers): 1, 11, 111, 1111, ...
     * R_n = (10^n - 1) / 9
     */
    generateRepunits(nDigits, base = 10) {
        const cacheKey = `${nDigits}-${base}`;
        
        if (this.generatedRepunits.has(cacheKey)) {
            return this.generatedRepunits.get(cacheKey);
        }

        const repunits = [];
        for (let n = 1; n <= nDigits; n++) {
            const repunitStr = '1'.repeat(n);
            const repunit = parseInt(repunitStr, base);
            repunits.push(repunit);
        }

        this.generatedRepunits.set(cacheKey, repunits);
        return repunits;
    }

    /**
     * Calculate square roots of repunits
     */
    calculateSquareRoots(repunits) {
        return repunits.map(r => {
            if (this.squareRootCache.has(r)) {
                return this.squareRootCache.get(r);
            }
            
            const sqrt = Math.sqrt(r);
            this.squareRootCache.set(r, sqrt);
            return sqrt;
        });
    }

    /**
     * Check if number is perfect square
     */
    isPerfectSquare(n) {
        if (this.perfectSquareCache.has(n)) {
            return this.perfectSquareCache.get(n);
        }

        const root = Math.floor(Math.sqrt(n));
        const isPerfect = root * root === n;
        this.perfectSquareCache.set(n, isPerfect);
        return isPerfect;
    }

    /**
     * Check if number is palindrome
     */
    isPalindrome(n) {
        const str = n.toString();
        return str === str.split('').reverse().join('');
    }

    /**
     * Find palindromic perfect squares up to limit
     * Returns squares where both the number and its root are palindromes
     */
    findPalindromicSquares(limit = 10000) {
        const results = [];
        for (let i = 1; i < limit; i++) {
            if (this.isPerfectSquare(i) && this.isPalindrome(i)) {
                const root = Math.floor(Math.sqrt(i));
                if (this.isPalindrome(root)) {
                    results.push({ square: i, root: root });
                }
            }
        }
        return results;
    }

    /**
     * Solve quadratic equation with mirror coefficient: x² + mx + m = 0
     * Returns real or complex roots
     */
    solveQuadraticWithMirror(m) {
        const a = 1, b = m, c = m;
        const discriminant = b * b - 4 * a * c;
        
        if (discriminant < 0) {
            // Complex roots
            const realPart = -b / (2 * a);
            const imagPart = Math.sqrt(-discriminant) / (2 * a);
            return {
                type: 'complex',
                roots: [
                    { real: realPart, imaginary: imagPart },
                    { real: realPart, imaginary: -imagPart }
                ],
                discriminant
            };
        }
        
        // Real roots
        const sqrtDiscriminant = Math.sqrt(discriminant);
        return {
            type: 'real',
            roots: [
                (-b + sqrtDiscriminant) / (2 * a),
                (-b - sqrtDiscriminant) / (2 * a)
            ],
            discriminant
        };
    }
}

module.exports = {
    GoldenRatioMath,
    MirrorNumberSystem
};
