/*
 * SOLIDARITY PLATFORM - HANKO STAMP AUTHENTICATION SYSTEM
 * ========================================================
 * 
 * Japanese-style digital signature seal system for multi-factor authentication
 * Combines traditional Hanko (判子/印鑑) concepts with modern cryptography
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { PHI, PHI_RECIPROCAL, CONTROL_RATIO, SACRED_NODES } = require('../utils/constants');

/**
 * Hanko Stamp Security System
 * 
 * Implements Japanese-style authentication seal verification with:
 * - Personal seal (個人印 - kojin-in): User identity stamp
 * - Registered seal (実印 - jitsuin): Verified legal identity
 * - Company seal (社印 - shain): Organizational identity
 * - φ-Ratio validation for mathematical integrity
 * - Sacred node verification (1,3,4,7,14,21,49)
 */
class HankoStampSecurity {
  constructor(config = {}) {
    this.PHI = PHI;
    this.BRIDGING_BASELINE = PHI_RECIPROCAL;
    this.CONTROL_RATIO = CONTROL_RATIO;
    this.SACRED_NODES = SACRED_NODES;
    
    // Safety integration
    this.safetyLevel = config.safetyLevel || 0.618;
    
    // Hanko database path
    this.hankoDbPath = config.dbPath || path.join(__dirname, '../database/hanko_stamps.json');
    this.hankoStamps = [];
    
    // Stamp types (traditional Japanese seal categories)
    this.stampTypes = {
      KOJIN: 'personal',      // 個人印 - Personal seal
      JITSUIN: 'registered',  // 実印 - Registered seal (legal)
      GINKOIN: 'bank',        // 銀行印 - Bank seal
      SHAIN: 'company'        // 社印 - Company seal
    };
    
    // Security levels aligned with 7-tier safety
    this.securityLevels = {
      CRITICAL_EMERGENCY: 0.05,
      WARNING: 0.15,
      CAUTION: 0.25,
      OPTIMAL: 0.618,
      UPPER_CAUTION: 0.75,
      UPPER_WARNING: 0.85,
      CRITICAL_UPPER: 0.95
    };
    
    this.loadHankoDatabase();
  }

  /**
   * Load Hanko stamp database
   */
  async loadHankoDatabase() {
    try {
      const data = await fs.readFile(this.hankoDbPath, 'utf-8');
      this.hankoStamps = JSON.parse(data);
    } catch (err) {
      // File doesn't exist, create empty database
      this.hankoStamps = [];
      await this.saveHankoDatabase();
    }
  }

  /**
   * Save Hanko stamp database
   */
  async saveHankoDatabase() {
    const dir = path.dirname(this.hankoDbPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.hankoDbPath, JSON.stringify(this.hankoStamps, null, 2));
  }

  /**
   * Create a new Hanko stamp (digital seal)
   * 
   * @param {Object} options - Stamp creation options
   * @param {string} options.userId - User ID
   * @param {string} options.username - Username
   * @param {string} options.type - Stamp type (personal, registered, bank, company)
   * @param {Object} options.metadata - Additional metadata
   * @returns {Object} - Created Hanko stamp
   */
  async createHankoStamp(options) {
    const { userId, username, type = 'personal', metadata = {} } = options;
    
    // Safety check
    if (this.safetyLevel < this.securityLevels.CAUTION) {
      throw new Error('Safety level too low for Hanko stamp creation');
    }
    
    // Generate unique stamp ID using φ-ratio
    const timestamp = Date.now();
    const phiComponent = Math.floor(timestamp * this.PHI);
    const stampId = `hanko_${userId}_${phiComponent.toString(16)}`;
    
    // Generate stamp signature (cryptographic seal)
    const stampData = {
      userId,
      username,
      type,
      timestamp,
      phiComponent,
      sacredNode: this.findNearestSacredNode(phiComponent % 100)
    };
    
    const stampSignature = this.generateStampSignature(stampData);
    
    // Create Hanko stamp record
    const hankoStamp = {
      id: stampId,
      userId,
      username,
      type,
      signature: stampSignature,
      phiFingerprint: this.calculatePhiFingerprint(stampData),
      sacredNode: stampData.sacredNode,
      createdAt: new Date(timestamp).toISOString(),
      verifiedAt: null,
      revoked: false,
      safetyLevel: this.safetyLevel,
      metadata
    };
    
    // Store stamp
    this.hankoStamps.push(hankoStamp);
    await this.saveHankoDatabase();
    
    console.log(`🎴 Hanko stamp created: ${stampId} (${type}, node ${stampData.sacredNode})`);
    
    return {
      success: true,
      stamp: hankoStamp,
      message: `Hanko ${type} seal created for ${username}`
    };
  }

  /**
   * Verify a Hanko stamp
   * 
   * @param {string} stampId - Stamp ID to verify
   * @param {Object} verificationData - Data to verify against
   * @returns {Object} - Verification result
   */
  async verifyHankoStamp(stampId, verificationData = {}) {
    // Safety check
    if (this.safetyLevel < this.securityLevels.WARNING) {
      return {
        valid: false,
        error: 'Safety level too low for verification',
        safetyRestriction: true
      };
    }
    
    // Find stamp
    const stamp = this.hankoStamps.find(s => s.id === stampId);
    
    if (!stamp) {
      return {
        valid: false,
        error: 'Hanko stamp not found',
        stampId
      };
    }
    
    // Check revocation
    if (stamp.revoked) {
      return {
        valid: false,
        error: 'Hanko stamp has been revoked',
        revokedAt: stamp.revokedAt
      };
    }
    
    // Verify signature integrity
    const expectedSignature = this.generateStampSignature({
      userId: stamp.userId,
      username: stamp.username,
      type: stamp.type,
      timestamp: new Date(stamp.createdAt).getTime(),
      phiComponent: parseInt(stamp.id.split('_')[2], 16),
      sacredNode: stamp.sacredNode
    });
    
    if (stamp.signature !== expectedSignature) {
      return {
        valid: false,
        error: 'Stamp signature mismatch - tampering detected',
        integrity: false
      };
    }
    
    // φ-Ratio validation
    const phiValid = this.validatePhiIntegrity(stamp);
    
    if (!phiValid) {
      return {
        valid: false,
        error: 'φ-ratio integrity check failed',
        phiValidation: false
      };
    }
    
    // Update verification timestamp
    stamp.verifiedAt = new Date().toISOString();
    await this.saveHankoDatabase();
    
    console.log(`✅ Hanko stamp verified: ${stampId} (${stamp.type})`);
    
    return {
      valid: true,
      stamp: {
        id: stamp.id,
        userId: stamp.userId,
        username: stamp.username,
        type: stamp.type,
        sacredNode: stamp.sacredNode,
        createdAt: stamp.createdAt,
        verifiedAt: stamp.verifiedAt
      },
      integrity: true,
      phiValidation: true,
      safetyLevel: this.safetyLevel
    };
  }

  /**
   * Imprint Hanko stamp on data (sign data)
   * 
   * @param {string} stampId - Stamp ID to use
   * @param {Object} data - Data to sign
   * @returns {Object} - Signed data with Hanko imprint
   */
  async imprintHankoStamp(stampId, data) {
    // Verify stamp exists and is valid
    const verification = await this.verifyHankoStamp(stampId);
    
    if (!verification.valid) {
      throw new Error(`Cannot imprint with invalid stamp: ${verification.error}`);
    }
    
    const stamp = this.hankoStamps.find(s => s.id === stampId);
    
    // Generate imprint signature (combines data + stamp)
    const imprintData = {
      data,
      stampId,
      userId: stamp.userId,
      timestamp: Date.now(),
      sacredNode: stamp.sacredNode
    };
    
    const imprintSignature = this.generateImprintSignature(imprintData);
    
    // Create Hanko imprint
    const imprint = {
      stampId,
      userId: stamp.userId,
      username: stamp.username,
      type: stamp.type,
      signature: imprintSignature,
      phiFingerprint: this.calculatePhiFingerprint(imprintData),
      sacredNode: stamp.sacredNode,
      timestamp: new Date(imprintData.timestamp).toISOString(),
      safetyLevel: this.safetyLevel
    };
    
    console.log(`🎴 Hanko imprinted on data by ${stamp.username} (node ${stamp.sacredNode})`);
    
    return {
      success: true,
      data,
      hankoImprint: imprint,
      message: `Data sealed with ${stamp.type} Hanko`
    };
  }

  /**
   * Verify Hanko imprint on data
   * 
   * @param {Object} signedData - Data with Hanko imprint
   * @returns {Object} - Verification result
   */
  async verifyHankoImprint(signedData) {
    if (!signedData.hankoImprint) {
      return {
        valid: false,
        error: 'No Hanko imprint found on data'
      };
    }
    
    const { data, hankoImprint } = signedData;
    
    // Verify stamp is still valid
    const stampVerification = await this.verifyHankoStamp(hankoImprint.stampId);
    
    if (!stampVerification.valid) {
      return {
        valid: false,
        error: 'Hanko stamp is no longer valid',
        stampError: stampVerification.error
      };
    }
    
    // Verify imprint signature
    const imprintData = {
      data,
      stampId: hankoImprint.stampId,
      userId: hankoImprint.userId,
      timestamp: new Date(hankoImprint.timestamp).getTime(),
      sacredNode: hankoImprint.sacredNode
    };
    
    const expectedSignature = this.generateImprintSignature(imprintData);
    
    if (hankoImprint.signature !== expectedSignature) {
      return {
        valid: false,
        error: 'Imprint signature mismatch - data has been tampered',
        integrity: false
      };
    }
    
    console.log(`✅ Hanko imprint verified: ${hankoImprint.stampId}`);
    
    return {
      valid: true,
      hankoImprint: {
        stampId: hankoImprint.stampId,
        userId: hankoImprint.userId,
        username: hankoImprint.username,
        type: hankoImprint.type,
        timestamp: hankoImprint.timestamp,
        sacredNode: hankoImprint.sacredNode
      },
      integrity: true,
      safetyLevel: this.safetyLevel
    };
  }

  /**
   * Revoke a Hanko stamp
   * 
   * @param {string} stampId - Stamp ID to revoke
   * @param {string} reason - Reason for revocation
   * @returns {Object} - Revocation result
   */
  async revokeHankoStamp(stampId, reason = 'User requested') {
    const stamp = this.hankoStamps.find(s => s.id === stampId);
    
    if (!stamp) {
      return {
        success: false,
        error: 'Hanko stamp not found'
      };
    }
    
    if (stamp.revoked) {
      return {
        success: false,
        error: 'Hanko stamp already revoked',
        revokedAt: stamp.revokedAt
      };
    }
    
    // Revoke stamp
    stamp.revoked = true;
    stamp.revokedAt = new Date().toISOString();
    stamp.revocationReason = reason;
    
    await this.saveHankoDatabase();
    
    console.log(`🚫 Hanko stamp revoked: ${stampId} (${reason})`);
    
    return {
      success: true,
      stampId,
      revokedAt: stamp.revokedAt,
      reason
    };
  }

  /**
   * Generate cryptographic stamp signature
   * 
   * @param {Object} data - Data to sign
   * @returns {string} - Signature
   */
  generateStampSignature(data) {
    const dataString = JSON.stringify(data);
    return crypto
      .createHash('sha256')
      .update(dataString)
      .digest('hex');
  }

  /**
   * Generate imprint signature (data + stamp)
   * 
   * @param {Object} imprintData - Imprint data
   * @returns {string} - Signature
   */
  generateImprintSignature(imprintData) {
    const dataString = JSON.stringify(imprintData);
    return crypto
      .createHmac('sha256', 'hanko_secret_key')
      .update(dataString)
      .digest('hex');
  }

  /**
   * Calculate φ-ratio fingerprint
   * 
   * @param {Object} data - Data to fingerprint
   * @returns {number} - φ-based fingerprint
   */
  calculatePhiFingerprint(data) {
    const dataString = JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Apply φ-ratio transformation
    const phiHash = Math.abs(hash) * this.PHI;
    return parseFloat((phiHash % 1).toFixed(16)); // Return fractional part with precision
  }

  /**
   * Validate φ-ratio integrity
   * 
   * @param {Object} stamp - Hanko stamp to validate
   * @returns {boolean} - Whether φ-ratio is valid
   */
  validatePhiIntegrity(stamp) {
    const recalculatedFingerprint = this.calculatePhiFingerprint({
      userId: stamp.userId,
      username: stamp.username,
      type: stamp.type,
      timestamp: new Date(stamp.createdAt).getTime(),
      phiComponent: parseInt(stamp.id.split('_')[2], 16),
      sacredNode: stamp.sacredNode
    });
    
    // Allow small floating-point error
    const diff = Math.abs(stamp.phiFingerprint - recalculatedFingerprint);
    return diff < 1e-10;
  }

  /**
   * Find nearest sacred node
   * 
   * @param {number} value - Value to find nearest node for
   * @returns {number} - Nearest sacred node
   */
  findNearestSacredNode(value) {
    return this.SACRED_NODES.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  }

  /**
   * Get all Hanko stamps for a user
   * 
   * @param {string} userId - User ID
   * @returns {Array} - User's Hanko stamps
   */
  getUserHankoStamps(userId) {
    return this.hankoStamps.filter(s => s.userId === userId && !s.revoked);
  }

  /**
   * Get Hanko system statistics
   * 
   * @returns {Object} - System stats
   */
  getSystemStats() {
    const total = this.hankoStamps.length;
    const revoked = this.hankoStamps.filter(s => s.revoked).length;
    const byType = {};
    
    Object.values(this.stampTypes).forEach(type => {
      byType[type] = this.hankoStamps.filter(s => s.type === type && !s.revoked).length;
    });
    
    return {
      total,
      active: total - revoked,
      revoked,
      byType,
      safetyLevel: this.safetyLevel,
      phiConstant: this.PHI,
      bridgingBaseline: this.BRIDGING_BASELINE
    };
  }
}

module.exports = { HankoStampSecurity };
