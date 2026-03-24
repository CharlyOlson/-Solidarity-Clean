/*
 * SOLIDARITY PLATFORM - LICENSE SYSTEM TESTS
 * ===========================================
 * Tests for license key generation, validation, and tier enforcement
 */

const {
    TIERS,
    generateLicenseKey,
    validateLicenseKey
} = require('../../src/api/middleware/license');

describe('License Key System', () => {
    describe('TIERS', () => {
        it('should define 4 tiers with correct hierarchy', () => {
            expect(TIERS.observer.level).toBe(0);
            expect(TIERS.student.level).toBe(1);
            expect(TIERS.practitioner.level).toBe(2);
            expect(TIERS.operator.level).toBe(3);
        });

        it('should restrict observer tier to docs only', () => {
            expect(TIERS.observer.financial).toBe(false);
            expect(TIERS.observer.aiAccess).toBe(false);
            expect(TIERS.observer.maxStamps).toBe(0);
            expect(TIERS.observer.testModeOnly).toBe(true);
        });

        it('should allow operator tier full access', () => {
            expect(TIERS.operator.features).toEqual(['*']);
            expect(TIERS.operator.financial).toBe(true);
            expect(TIERS.operator.testModeOnly).toBe(false);
            expect(TIERS.operator.maxStamps).toBe(-1);
        });

        it('should enforce test mode for non-operator tiers', () => {
            expect(TIERS.observer.testModeOnly).toBe(true);
            expect(TIERS.student.testModeOnly).toBe(true);
            expect(TIERS.practitioner.testModeOnly).toBe(true);
            expect(TIERS.operator.testModeOnly).toBe(false);
        });
    });

    describe('generateLicenseKey', () => {
        it('should generate a valid key for each tier', () => {
            for (const tier of Object.keys(TIERS)) {
                const result = generateLicenseKey(tier, 'testuser', 365);
                expect(result.key).toMatch(/^SOL-/);
                expect(result.tier).toBe(tier);
                expect(result.userId).toBe('testuser');
                expect(result.daysValid).toBe(365);
                expect(result.tierInfo).toEqual(TIERS[tier]);
            }
        });

        it('should include expiration date in the key', () => {
            const result = generateLicenseKey('student', 'alice', 30);
            expect(result.expiresAt).toBeDefined();

            const expires = new Date(result.expiresAt);
            const now = new Date();
            const diffDays = (expires - now) / (1000 * 60 * 60 * 24);
            expect(diffDays).toBeGreaterThan(29);
            expect(diffDays).toBeLessThan(31);
        });

        it('should reject invalid tier names', () => {
            expect(() => generateLicenseKey('admin', 'user')).toThrow('Invalid tier');
            expect(() => generateLicenseKey('superuser', 'user')).toThrow('Invalid tier');
        });

        it('should generate unique keys for different users', () => {
            const key1 = generateLicenseKey('student', 'alice', 365);
            const key2 = generateLicenseKey('student', 'bob', 365);
            expect(key1.key).not.toBe(key2.key);
        });

        it('should generate different keys for different tiers', () => {
            const key1 = generateLicenseKey('student', 'alice', 365);
            const key2 = generateLicenseKey('operator', 'alice', 365);
            expect(key1.key).not.toBe(key2.key);
        });
    });

    describe('validateLicenseKey', () => {
        it('should validate a freshly generated key', () => {
            const { key } = generateLicenseKey('practitioner', 'testuser', 365);
            const result = validateLicenseKey(key);

            expect(result.valid).toBe(true);
            expect(result.tier).toBe('practitioner');
            expect(result.userId).toBe('testuser');
            expect(result.tierInfo).toEqual(TIERS.practitioner);
        });

        it('should reject null/undefined keys', () => {
            expect(validateLicenseKey(null).valid).toBe(false);
            expect(validateLicenseKey(undefined).valid).toBe(false);
            expect(validateLicenseKey('').valid).toBe(false);
        });

        it('should reject malformed keys', () => {
            expect(validateLicenseKey('not-a-key').valid).toBe(false);
            expect(validateLicenseKey('SOL-FAKE').valid).toBe(false);
            expect(validateLicenseKey('ABC-STUDENT-user-20260101-aaa').valid).toBe(false);
        });

        it('should reject keys with tampered signatures', () => {
            const { key } = generateLicenseKey('student', 'alice', 365);
            const tampered = key.slice(0, -3) + 'XXX';
            const result = validateLicenseKey(tampered);

            expect(result.valid).toBe(false);
            expect(result.error).toMatch(/tampered/i);
        });

        it('should reject expired keys', () => {
            const { key } = generateLicenseKey('student', 'alice', -1);
            const result = validateLicenseKey(key);

            expect(result.valid).toBe(false);
            expect(result.error).toMatch(/expired/i);
        });

        it('should return correct tier info on validation', () => {
            const { key } = generateLicenseKey('operator', 'enterprise', 730);
            const result = validateLicenseKey(key);

            expect(result.valid).toBe(true);
            expect(result.tierInfo.level).toBe(3);
            expect(result.tierInfo.features).toEqual(['*']);
            expect(result.tierInfo.testModeOnly).toBe(false);
        });

        it('should validate all 4 tiers correctly', () => {
            for (const tier of Object.keys(TIERS)) {
                const { key } = generateLicenseKey(tier, `user_${tier}`, 365);
                const result = validateLicenseKey(key);

                expect(result.valid).toBe(true);
                expect(result.tier).toBe(tier);
                expect(result.tierInfo.level).toBe(TIERS[tier].level);
            }
        });
    });
});
