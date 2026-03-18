/*
 * SOLIDARITY PLATFORM - API ROUTE TESTS
 * ====================================
 * Tests for all REST API endpoints using supertest
 * Validates auth, persistence, and full request/response cycle
 */

const request = require('supertest');
const app = require('../../src/api/server');
const { db, stmts } = require('../../src/api/db');
const { generateToken } = require('../../src/api/middleware/auth');

describe('API Routes', () => {
  // Setup: clear database before each test
  beforeEach(() => {
    try {
      stmts.deleteAllStamps.run();
      stmts.deleteAllSettings.run();
      stmts.deleteAllLogs.run();
      stmts.deleteAllUsers.run();
    } catch (_) {
      // Tables might not exist in cleanup
    }
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.version).toBe('2.41.0');
      expect(res.body.phi).toBe(1.618033988749895);
      expect(res.body.safetyLevel).toBe(0.618);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'SecurePass123!'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user.password).toBeUndefined(); // Password never sent back
    });

    it('should reject duplicate usernames', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'duplicate', password: 'Pass123!' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'duplicate', password: 'Pass123!' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should reject weak passwords', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'user', password: '123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'SecurePass123!' });
    });

    it('should login and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'SecurePass123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject unknown user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nobody', password: 'Pass123!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/hanko/create', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ username: 'hanko_user', password: 'SecurePass123!' });
      token = reg.body.token;
    });

    it('should create a Hanko stamp with auth', async () => {
      const res = await request(app)
        .post('/api/hanko/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          inputs: { name: 'John Doe', amount: 100 },
          preview: { convergence: 0.618, phi: 1.618 },
          type: 'personal'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.stamp).toBeDefined();
      expect(res.body.stamp.id).toMatch(/^hanko-/);
      expect(res.body.stamp.type).toBe('personal');
      expect(res.body.stamp.convergenceScore).toBe(0.618);
      expect(res.body.stamp.status).toBe('active');
    });

    it('should reject requests without auth token', async () => {
      const res = await request(app)
        .post('/api/hanko/create')
        .send({ inputs: {}, preview: {} });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should persist to database', async () => {
      const create = await request(app)
        .post('/api/hanko/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ inputs: {}, preview: {} });

      const stampId = create.body.stamp.id;

      // Query database directly
      const stamp = db.prepare('SELECT * FROM hanko_stamps WHERE id = ?').get(stampId);
      expect(stamp).toBeDefined();
      expect(stamp.status).toBe('active');
    });
  });

  describe('GET /api/hanko/my-stamps', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ username: 'stamps_user', password: 'SecurePass123!' });
      token = reg.body.token;

      // Create 2 stamps
      await request(app)
        .post('/api/hanko/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ inputs: { a: 1 }, preview: {}, type: 'personal' });

      await request(app)
        .post('/api/hanko/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ inputs: { b: 2 }, preview: {}, type: 'shared' });
    });

    it('should list user stamps', async () => {
      const res = await request(app)
        .get('/api/hanko/my-stamps')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.stamps)).toBe(true);
      expect(res.body.stamps.length).toBeGreaterThanOrEqual(2);
    });

    it('should reject requests without auth', async () => {
      const res = await request(app).get('/api/hanko/my-stamps');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/hanko/revoke/:id', () => {
    let token, stampId;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ username: 'revoke_user', password: 'SecurePass123!' });
      token = reg.body.token;

      const create = await request(app)
        .post('/api/hanko/create')
        .set('Authorization', `Bearer ${token}`)
        .send({ inputs: {}, preview: {} });

      stampId = create.body.stamp.id;
    });

    it('should revoke a stamp', async () => {
      const res = await request(app)
        .post(`/api/hanko/revoke/${stampId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stamp.status).toBe('revoked');
    });

    it('should persist revocation to database', async () => {
      await request(app)
        .post(`/api/hanko/revoke/${stampId}`)
        .set('Authorization', `Bearer ${token}`);

      const stamp = db.prepare('SELECT * FROM hanko_stamps WHERE id = ?').get(stampId);
      expect(stamp.status).toBe('revoked');
    });

    it('should return 404 for nonexistent stamp', async () => {
      const res = await request(app)
        .post('/api/hanko/revoke/hanko-nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/user/settings', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ username: 'settings_user', password: 'SecurePass123!' });
      token = reg.body.token;
    });

    it('should get user settings', async () => {
      const res = await request(app)
        .get('/api/user/settings')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.settings).toBeDefined();
      expect(res.body.settings.safetyLevel).toBe(0.618);
    });

    it('should reject requests without auth', async () => {
      const res = await request(app).get('/api/user/settings');

      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/user/settings', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ username: 'update_user', password: 'SecurePass123!' });
      token = reg.body.token;
    });

    it('should update user settings', async () => {
      const res = await request(app)
        .put('/api/user/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ theme: 'light', notifications: false, safetyLevel: 0.75 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.settings.theme).toBe('light');
      expect(res.body.settings.notifications).toBe(false);
      expect(res.body.settings.safetyLevel).toBe(0.75);
    });

    it('should persist changes to database', async () => {
      const userId = 'update_user'; // Simplified for test

      await request(app)
        .put('/api/user/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ theme: 'dark', safetyLevel: 0.5 });

      const settings = db.prepare('SELECT * FROM user_settings LIMIT 1').get();
      expect(settings).toBeDefined();
    });
  });

  describe('POST /api/logs/activity', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ username: 'log_user', password: 'SecurePass123!' });
      token = reg.body.token;
    });

    it('should log activity', async () => {
      const res = await request(app)
        .post('/api/logs/activity')
        .set('Authorization', `Bearer ${token}`)
        .send({
          action: 'stamp_created',
          resource: 'hanko_stamps',
          details: { id: 'hanko-123' }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should persist activity log to database', async () => {
      await request(app)
        .post('/api/logs/activity')
        .set('Authorization', `Bearer ${token}`)
        .send({
          action: 'test_action',
          resource: 'test_resource'
        });

      const logs = db.prepare('SELECT * FROM activity_logs WHERE action = ?').all('test_action');
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should require auth token', async () => {
      const res = await request(app)
        .post('/api/logs/activity')
        .send({ action: 'test' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/ai/chat', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ username: 'ai_user', password: 'SecurePass123!' });
      token = reg.body.token;
    });

    it('should accept chat requests with auth', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'Hello', safetyLevel: 0.618 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.response).toBeDefined();
    });

    it('should return offline message when Ollama unavailable', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'Test' });

      expect(res.status).toBe(200);
      expect(res.body.offline).toBe(true);
    });

    it('should require auth', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .send({ message: 'Test' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/ai/live-context', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ username: 'context_user', password: 'SecurePass123!' });
      token = reg.body.token;
    });

    it('should return live context', async () => {
      const res = await request(app)
        .get('/api/ai/live-context')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.safetyLevel).toBe(0.618);
      expect(res.body.phi).toBe(1.618033988749895);
      expect(Array.isArray(res.body.sacredNodes)).toBe(true);
    });

    it('should require auth', async () => {
      const res = await request(app).get('/api/ai/live-context');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/session/start', () => {
    let token;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ username: 'session_user', password: 'SecurePass123!' });
      token = reg.body.token;
    });

    it('should start a new session', async () => {
      const res = await request(app)
        .post('/api/session/start')
        .set('Authorization', `Bearer ${token}`)
        .send({ prompt: 'Hello', context: {}, settings: {} });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should require auth', async () => {
      const res = await request(app)
        .post('/api/session/start')
        .send({ prompt: 'Test' });

      expect(res.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 routes gracefully', async () => {
      const res = await request(app).get('/api/nonexistent');

      expect(res.status).toBe(404);
    });

    it('should reject requests with invalid JWT', async () => {
      const res = await request(app)
        .get('/api/user/settings')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(res.status).toBe(401);
    });

    it('should validate request bodies', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'valid_user' }); // Missing password

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
