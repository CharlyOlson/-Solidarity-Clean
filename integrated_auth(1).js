/*
 * SOLIDARITY PLATFORM - INTEGRATED AUTHENTICATION SYSTEM
 * =======================================================
 * 
 * Hybrid Authentication combining:
 * - JWT tokens (modern web standard)
 * - Hanko stamps (Japanese-style seals)
 * - φ-ratio verification
 * - 7-tier safety integration
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');
const { HankoStampSecurity } = require('./hanko_stamp_security.js');

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_IN_PRODUCTION_phi_1.618033988749895';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const USERS_FILE = path.join(__dirname, '../../database/users.json');
const SALT_ROUNDS = 10;

/**
 * Integrated Authentication Manager
 * Combines JWT + Hanko stamps for multi-factor security
 */
class IntegratedAuthManager {
  constructor(config = {}) {
    this.PHI = 1.618033988749895;
    this.BRIDGING_BASELINE = 0.618;
    this.safetyLevel = config.safetyLevel || 0.618;
    
    // Initialize Hanko system
    this.hankoSecurity = new HankoStampSecurity({ safetyLevel: this.safetyLevel });
    
    // User database
    this.users = [];
    this.loadUsers();
    
    // Safety thresholds
    this.safetyThresholds = {
      CRITICAL_EMERGENCY: { min: 0.00, max: 0.05 },
      WARNING_LEVEL: { min: 0.05, max: 0.15 },
      CAUTION_RANGE: { min: 0.15, max: 0.25 },
      OPTIMAL_RANGE: { min: 0.25, max: 0.75 },
      UPPER_CAUTION: { min: 0.75, max: 0.85 },
      UPPER_WARNING: { min: 0.85, max: 0.95 },
      CRITICAL_UPPER: { min: 0.95, max: 1.00 }
    };
  }

  /**
   * Load user database
   */
  async loadUsers() {
    try {
      const data = await fs.readFile(USERS_FILE, 'utf-8');
      this.users = JSON.parse(data);
    } catch (err) {
      // File doesn't exist, create with default admin
      this.users = [{
        id: '1',
        username: 'admin',
        email: 'admin@solidarity.local',
        passwordHash: await bcrypt.hash('solidarity618', SALT_ROUNDS),
        role: 'admin',
        hankoStamps: [],
        safetyLevel: 0.618,
        createdAt: new Date().toISOString(),
        lastLogin: null
      }];
      await this.saveUsers();
    }
  }

  /**
   * Save user database
   */
  async saveUsers() {
    const dir = path.dirname(USERS_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify(this.users, null, 2));
  }

  /**
   * Register new user with automatic Hanko stamp creation
   * 
   * @param {Object} userData - User registration data
   * @returns {Object} - Registration result with JWT and Hanko
   */
  async register(userData) {
    const { username, email, password, role = 'user' } = userData;
    
    // Safety check
    if (this.safetyLevel < 0.25) {
      throw new Error('Safety level too low for user registration');
    }
    
    // Validate input
    if (!username || !email || !password) {
      throw new Error('Missing required fields: username, email, password');
    }
    
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    // Check if user exists
    const existing = this.users.find(u => u.username === username || u.email === email);
    if (existing) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Generate user ID with φ-ratio
    const userId = this.generatePhiBasedId();
    
    // Create user
    const user = {
      id: userId,
      username,
      email,
      passwordHash,
      role,
      hankoStamps: [],
      safetyLevel: this.BRIDGING_BASELINE,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };
    
    // Create personal Hanko stamp (個人印 - kojin-in)
    const hankoResult = await this.hankoSecurity.createHankoStamp({
      userId,
      username,
      type: 'personal',
      metadata: { email, registeredAt: user.createdAt }
    });
    
    if (hankoResult.success) {
      user.hankoStamps.push(hankoResult.stamp.id);
    }
    
    // Add user to database
    this.users.push(user);
    await this.saveUsers();
    
    // Generate JWT token
    const token = this.generateJWT(user);
    
    console.log(`✅ User registered: ${username} (ID: ${userId}, Hanko: ${hankoResult.stamp.id})`);
    
    return {
      success: true,
      user: this.sanitizeUser(user),
      token,
      hankoStamp: hankoResult.stamp.id,
      message: `Welcome ${username}! Your personal Hanko seal has been created.`
    };
  }

  /**
   * Login with username/password + Hanko verification
   * 
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {Object} options - Login options
   * @returns {Object} - Login result with JWT and Hanko verification
   */
  async login(username, password, options = {}) {
    // Safety check
    if (this.safetyLevel < 0.15) {
      throw new Error('Safety level too low for authentication');
    }
    
    // Find user
    const user = this.users.find(u => u.username === username);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }
    
    // Verify Hanko stamps (if user has any)
    const hankoVerifications = [];
    for (const stampId of user.hankoStamps) {
      const verification = await this.hankoSecurity.verifyHankoStamp(stampId);
      hankoVerifications.push({
        stampId,
        valid: verification.valid,
        error: verification.error || null
      });
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    await this.saveUsers();
    
    // Generate JWT token
    const token = this.generateJWT(user);
    
    console.log(`🔐 User logged in: ${username} (${hankoVerifications.length} Hanko stamps verified)`);
    
    return {
      success: true,
      user: this.sanitizeUser(user),
      token,
      hankoVerifications,
      safetyLevel: this.safetyLevel,
      message: `Welcome back, ${username}!`
    };
  }

  /**
   * Verify JWT token + optional Hanko verification
   * 
   * @param {string} token - JWT token
   * @param {string} hankoStampId - Optional Hanko stamp ID for additional verification
   * @returns {Object} - Verification result
   */
  async verifyToken(token, hankoStampId = null) {
    try {
      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find user
      const user = this.users.find(u => u.id === decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Optional Hanko verification for high-security operations
      let hankoVerification = null;
      if (hankoStampId) {
        hankoVerification = await this.hankoSecurity.verifyHankoStamp(hankoStampId);
        
        if (!hankoVerification.valid) {
          throw new Error(`Hanko verification failed: ${hankoVerification.error}`);
        }
      }
      
      return {
        valid: true,
        user: this.sanitizeUser(user),
        hankoVerified: hankoVerification ? hankoVerification.valid : false,
        safetyLevel: this.safetyLevel
      };
      
    } catch (err) {
      return {
        valid: false,
        error: err.message
      };
    }
  }

  /**
   * Create additional Hanko stamp for user
   * (e.g., bank seal, company seal)
   * 
   * @param {string} userId - User ID
   * @param {string} stampType - Stamp type (bank, company, registered)
   * @param {Object} metadata - Additional metadata
   * @returns {Object} - Stamp creation result
   */
  async createAdditionalHankoStamp(userId, stampType, metadata = {}) {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Create new Hanko stamp
    const hankoResult = await this.hankoSecurity.createHankoStamp({
      userId,
      username: user.username,
      type: stampType,
      metadata
    });
    
    if (hankoResult.success) {
      user.hankoStamps.push(hankoResult.stamp.id);
      await this.saveUsers();
    }
    
    return hankoResult;
  }

  /**
   * Sign data with user's Hanko stamp
   * 
   * @param {string} userId - User ID
   * @param {Object} data - Data to sign
   * @param {string} stampType - Which stamp to use (personal, bank, etc.)
   * @returns {Object} - Signed data with Hanko imprint
   */
  async signDataWithHanko(userId, data, stampType = 'personal') {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Find appropriate stamp
    let stampId = null;
    for (const sid of user.hankoStamps) {
      const stamps = this.hankoSecurity.hankoStamps;
      const stamp = stamps.find(s => s.id === sid);
      if (stamp && stamp.type === stampType) {
        stampId = sid;
        break;
      }
    }
    
    if (!stampId) {
      throw new Error(`No ${stampType} Hanko stamp found for user`);
    }
    
    // Imprint Hanko on data
    return await this.hankoSecurity.imprintHankoStamp(stampId, data);
  }

  /**
   * Generate JWT token
   * 
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  generateJWT(user) {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      safetyLevel: user.safetyLevel,
      hankoStamps: user.hankoStamps.length,
      phiComponent: Math.floor(Date.now() * this.PHI) % 10000
    };
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  /**
   * Generate φ-based user ID
   * 
   * @returns {string} - User ID
   */
  generatePhiBasedId() {
    const timestamp = Date.now();
    const phiComponent = Math.floor(timestamp * this.PHI);
    const randomComponent = Math.floor(Math.random() * 1000);
    return `usr_${phiComponent.toString(16)}_${randomComponent.toString(16)}`;
  }

  /**
   * Remove sensitive data from user object
   * 
   * @param {Object} user - User object
   * @returns {Object} - Sanitized user
   */
  sanitizeUser(user) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Get authentication statistics
   * 
   * @returns {Object} - Auth stats
   */
  async getAuthStats() {
    const hankoStats = this.hankoSecurity.getSystemStats();
    
    return {
      users: {
        total: this.users.length,
        admins: this.users.filter(u => u.role === 'admin').length,
        regular: this.users.filter(u => u.role === 'user').length
      },
      hanko: hankoStats,
      safety: {
        level: this.safetyLevel,
        threshold: this.getCurrentSafetyThreshold(),
        phiConstant: this.PHI,
        bridgingBaseline: this.BRIDGING_BASELINE
      },
      jwt: {
        secret: JWT_SECRET.substring(0, 20) + '...',
        expiry: JWT_EXPIRY
      }
    };
  }

  /**
   * Get current safety threshold name
   * 
   * @returns {string} - Threshold name
   */
  getCurrentSafetyThreshold() {
    for (const [name, range] of Object.entries(this.safetyThresholds)) {
      if (this.safetyLevel >= range.min && this.safetyLevel <= range.max) {
        return name;
      }
    }
    return 'UNKNOWN';
  }
}

/**
 * Express middleware for JWT authentication
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No authentication token provided',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
      message: err.message
    });
  }
}

/**
 * Express middleware for role-based access control
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        required: role,
        current: req.user?.role || 'none'
      });
    }
    next();
  };
}

/**
 * Express middleware for Hanko stamp verification (high-security operations)
 */
function requireHankoVerification(authManager) {
  return async (req, res, next) => {
    const hankoStampId = req.headers['x-hanko-stamp-id'];
    
    if (!hankoStampId) {
      return res.status(401).json({
        success: false,
        error: 'Hanko stamp verification required for this operation',
        code: 'NO_HANKO_STAMP'
      });
    }
    
    try {
      const verification = await authManager.hankoSecurity.verifyHankoStamp(hankoStampId);
      
      if (!verification.valid) {
        return res.status(403).json({
          success: false,
          error: 'Invalid Hanko stamp',
          code: 'INVALID_HANKO',
          details: verification.error
        });
      }
      
      req.hankoVerification = verification;
      next();
      
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Hanko verification failed',
        code: 'HANKO_ERROR',
        message: err.message
      });
    }
  };
}

module.exports = {
  IntegratedAuthManager,
  authenticateToken,
  requireRole,
  requireHankoVerification
};
