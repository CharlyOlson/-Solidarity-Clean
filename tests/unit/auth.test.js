/*
 * SOLIDARITY PLATFORM - AUTH API TESTS
 * =====================================
 *
 * Tests for /api/auth endpoints (register, login, me)
 *
 * TRADEMARK INFORMATION:
 * Owner: Scott Charles Olson


 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const { generateToken, hashPassword, comparePassword, requireAuth, optionalAuth, JWT_SECRET } = require('../../src/api/middleware/auth');
const jwt = require('jsonwebtoken');

describe('Auth Middleware', () => {
  // ─── Token generation ─────────────────────────────────────────
  describe('generateToken', () => {
    it('returns a string JWT', () => {
      const token = generateToken({ id: 'u1', username: 'alice' });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('encodes id and username in payload', () => {
      const token = generateToken({ id: 'u1', username: 'alice' });
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.id).toBe('u1');
      expect(decoded.username).toBe('alice');
    });
  });

  // ─── Password hashing ─────────────────────────────────────────
  describe('hashPassword / comparePassword', () => {
    it('hashes a password and compares successfully', async () => {
      const hash = await hashPassword('solidarity618');
      expect(hash).not.toBe('solidarity618');
      const match = await comparePassword('solidarity618', hash);
      expect(match).toBe(true);
    });

    it('rejects wrong password', async () => {
      const hash = await hashPassword('correct');
      const match = await comparePassword('wrong', hash);
      expect(match).toBe(false);
    });
  });

  // ─── requireAuth middleware ────────────────────────────────────
  describe('requireAuth', () => {
    const mockRes = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };

    it('rejects requests without Authorization header', () => {
      const req = { headers: {} };
      const res = mockRes();
      const next = jest.fn();
      requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('rejects invalid tokens', () => {
      const req = { headers: { authorization: 'Bearer invalid.token.here' } };
      const res = mockRes();
      const next = jest.fn();
      requireAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('passes valid token and sets req.user', () => {
      const token = generateToken({ id: 'u1', username: 'alice' });
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = mockRes();
      const next = jest.fn();
      requireAuth(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(req.user.id).toBe('u1');
      expect(req.user.username).toBe('alice');
    });
  });

  // ─── optionalAuth middleware ───────────────────────────────────
  describe('optionalAuth', () => {
    it('falls back to demo user without a header', () => {
      const req = { headers: {} };
      const next = jest.fn();
      optionalAuth(req, {}, next);
      expect(next).toHaveBeenCalled();
      expect(req.user.id).toBe('demo-user');
    });

    it('decodes valid token when provided', () => {
      const token = generateToken({ id: 'u1', username: 'alice' });
      const req = { headers: { authorization: `Bearer ${token}` } };
      const next = jest.fn();
      optionalAuth(req, {}, next);
      expect(next).toHaveBeenCalled();
      expect(req.user.id).toBe('u1');
    });

    it('falls back to demo user on bad token', () => {
      const req = { headers: { authorization: 'Bearer garbage' } };
      const next = jest.fn();
      optionalAuth(req, {}, next);
      expect(next).toHaveBeenCalled();
      expect(req.user.id).toBe('demo-user');
    });
  });
});
