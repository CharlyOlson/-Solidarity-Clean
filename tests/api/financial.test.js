/*
 * SOLIDARITY PLATFORM - FINANCIAL API TESTS
 * =========================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const request = require('supertest');
const app = require('../../src/api/server');
const { db, stmts } = require('../../src/api/db');
const { generateLicenseKey } = require('../../src/api/middleware/license');
const { BRIDGING_BASELINE } = require('../../src/utils/constants');

const license = generateLicenseKey('operator', 'financial-tests', 365);
const LICENSE_KEY = license.key;

function authHeader(token) {
  return ['Bearer', token].join(' ');
}

function authed(token) {
  return {
    get: (path) => request(app).get(path).set('X-License-Key', LICENSE_KEY).set('Authorization', authHeader(token)),
    post: (path) => request(app).post(path).set('X-License-Key', LICENSE_KEY).set('Authorization', authHeader(token)),
    put: (path) => request(app).put(path).set('X-License-Key', LICENSE_KEY).set('Authorization', authHeader(token)),
    delete: (path) => request(app).delete(path).set('X-License-Key', LICENSE_KEY).set('Authorization', authHeader(token))
  };
}

async function registerUser(prefix = 'financial-user') {
  const compactPrefix = String(prefix).slice(0, 8);
  const username = `${compactPrefix}-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username, password: 'SecurePass123!' });

  return { username, token: res.body.token, userId: res.body.user.id };
}

async function createWalletForUser(token, body = {}) {
  return authed(token).post('/api/financial/wallet').send({
    walletName: 'primary-wallet',
    chain: 'ethereum',
    balance: 500,
    signerIdentity: 'tester:primary-wallet',
    node: 7,
    ...body
  });
}

describe('Financial API Routes', () => {
  beforeEach(() => {
    stmts.deleteAllFinancialTransactions.run();
    stmts.deleteAllFinancialBatches.run();
    stmts.deleteAllSmartContracts.run();
    stmts.deleteAllSessionCompletionReports.run();
    stmts.deleteAllFinancialWallets.run();
    stmts.deleteAllSettings.run();
    stmts.deleteAllLogs.run();
    stmts.deleteAllStamps.run();
    stmts.deleteAllUsers.run();
  });

  describe('wallet endpoints', () => {
    it('creates a persisted wallet with signer identity and public key', async () => {
      const { token, userId } = await registerUser('wallet-create');
      const res = await createWalletForUser(token);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.wallet.signerIdentity).toBe('tester:primary-wallet');
      expect(res.body.wallet.publicKey).toContain('BEGIN PUBLIC KEY');

      const row = stmts.getFinancialWalletById.get(res.body.wallet.id, userId);
      expect(row).toBeDefined();
      expect(row.signer_identity).toBe('tester:primary-wallet');
    });

    it('lists wallets for the authenticated user', async () => {
      const { token } = await registerUser('wallet-list');
      await createWalletForUser(token);

      const res = await authed(token).get('/api/financial/wallets');
      expect(res.status).toBe(200);
      expect(res.body.wallets).toHaveLength(1);
    });

    it('returns a wallet by id', async () => {
      const { token } = await registerUser('wallet-get');
      const created = await createWalletForUser(token);

      const res = await authed(token).get(`/api/financial/wallets/${created.body.wallet.id}`);
      expect(res.status).toBe(200);
      expect(res.body.wallet.walletName).toBe('primary-wallet');
    });

    it('rejects invalid sacred nodes', async () => {
      const { token } = await registerUser('wallet-node');
      const res = await createWalletForUser(token, { node: 49 });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/node/i);
    });
  });

  describe('transaction signing and audit endpoints', () => {
    it('creates a signed and verified transaction', async () => {
      const { token } = await registerUser('tx-create');
      const wallet = await createWalletForUser(token);

      const res = await authed(token).post('/api/financial/transaction').send({
        walletId: wallet.body.wallet.id,
        to: '0x1111111111111111111111111111111111111111',
        amount: 25,
        type: 'transfer'
      });

      expect(res.status).toBe(201);
      expect(res.body.transaction.signature).toBeDefined();
      expect(res.body.transaction.transactionHash).toMatch(/^[a-f0-9]{64}$/);
      expect(res.body.verified).toBe(true);
    });

    it('deducts wallet balance when a transaction is executed', async () => {
      const { token, userId } = await registerUser('tx-balance');
      const wallet = await createWalletForUser(token, { balance: 100 });

      await authed(token).post('/api/financial/transaction').send({
        walletId: wallet.body.wallet.id,
        to: '0x2222222222222222222222222222222222222222',
        amount: 30
      });

      const stored = stmts.getFinancialWalletById.get(wallet.body.wallet.id, userId);
      expect(stored.balance).toBe(70);
    });

    it('rejects transactions outside the active safety tier limit', async () => {
      const { token } = await registerUser('tx-safety');
      const wallet = await createWalletForUser(token, { safetyLevel: 0.1, balance: 100 });

      const res = await authed(token).post('/api/financial/transaction').send({
        walletId: wallet.body.wallet.id,
        to: '0x3333333333333333333333333333333333333333',
        amount: 40
      });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/limit/i);
    });

    it('lists transactions and supports status filtering', async () => {
      const { token } = await registerUser('tx-list');
      const wallet = await createWalletForUser(token);
      await authed(token).post('/api/financial/transaction').send({
        walletId: wallet.body.wallet.id,
        to: '0x4444444444444444444444444444444444444444',
        amount: 10
      });

      const res = await authed(token).get('/api/financial/transactions?status=executed');
      expect(res.status).toBe(200);
      expect(res.body.transactions).toHaveLength(1);
    });

    it('returns a transaction by id', async () => {
      const { token } = await registerUser('tx-get');
      const wallet = await createWalletForUser(token);
      const created = await authed(token).post('/api/financial/transaction').send({
        walletId: wallet.body.wallet.id,
        to: '0x5555555555555555555555555555555555555555',
        amount: 12
      });

      const res = await authed(token).get(`/api/financial/transaction/${created.body.transaction.id}`);
      expect(res.status).toBe(200);
      expect(res.body.transaction.id).toBe(created.body.transaction.id);
      expect(res.body.verified).toBe(true);
    });

    it('verifies a stored transaction signature and hash', async () => {
      const { token } = await registerUser('tx-verify');
      const wallet = await createWalletForUser(token);
      const created = await authed(token).post('/api/financial/transaction').send({
        walletId: wallet.body.wallet.id,
        to: '0x6666666666666666666666666666666666666666',
        amount: 18
      });

      const res = await authed(token).get(`/api/financial/transaction/${created.body.transaction.id}/verify`);
      expect(res.status).toBe(200);
      expect(res.body.verified).toBe(true);
      expect(res.body.transactionHashMatches).toBe(true);
    });

    it('updates a transaction and appends an audit entry', async () => {
      const { token } = await registerUser('tx-update');
      const wallet = await createWalletForUser(token, { balance: 250 });
      const created = await authed(token).post('/api/financial/transaction').send({
        walletId: wallet.body.wallet.id,
        to: '0x7777777777777777777777777777777777777777',
        amount: 25
      });

      const updated = await authed(token).put(`/api/financial/transaction/${created.body.transaction.id}`).send({
        amount: 20,
        note: 'reduced amount'
      });

      expect(updated.status).toBe(200);
      expect(updated.body.transaction.amount).toBe(20);

      const audit = await authed(token).get(`/api/financial/transaction/${created.body.transaction.id}/audit`);
      expect(audit.body.count).toBe(2);
      expect(audit.body.audit[1].operation).toBe('UPDATE');
    });

    it('soft deletes a transaction and records delete audit', async () => {
      const { token } = await registerUser('tx-delete');
      const wallet = await createWalletForUser(token);
      const created = await authed(token).post('/api/financial/transaction').send({
        walletId: wallet.body.wallet.id,
        to: '0x8888888888888888888888888888888888888888',
        amount: 50
      });

      const deleted = await authed(token).delete(`/api/financial/transaction/${created.body.transaction.id}`);
      expect(deleted.status).toBe(200);
      expect(deleted.body.transaction.status).toBe('deleted');

      const audit = await authed(token).get(`/api/financial/transaction/${created.body.transaction.id}/audit`);
      expect(audit.body.audit[audit.body.audit.length - 1].operation).toBe('DELETE');
    });

    it('prevents tampering with the immutable transaction audit table', async () => {
      const { token } = await registerUser('tx-immutable');
      const wallet = await createWalletForUser(token);
      const created = await authed(token).post('/api/financial/transaction').send({
        walletId: wallet.body.wallet.id,
        to: '0x9999999999999999999999999999999999999999',
        amount: 22
      });

      expect(() => {
        db.prepare('UPDATE transaction_audit SET operation = ? WHERE transaction_id = ?')
          .run('TAMPERED', created.body.transaction.id);
      }).toThrow(/append-only/);
    });
  });

  describe('optimizer and portfolio endpoints', () => {
    it('returns portfolio metrics for the current user', async () => {
      const { token } = await registerUser('portfolio');
      await createWalletForUser(token, { balance: 321 });

      const res = await authed(token).get('/api/financial/portfolio');
      expect(res.status).toBe(200);
      expect(res.body.portfolio.totalValue).toBe(321);
    });

    it('returns optimization recommendations', async () => {
      const { token } = await registerUser('optimize');
      await createWalletForUser(token, { balance: 200 });
      await createWalletForUser(token, {
        walletName: 'secondary-wallet',
        signerIdentity: 'tester:secondary-wallet',
        address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        balance: 100
      });

      const res = await authed(token).post('/api/financial/optimize').send({});
      expect(res.status).toBe(200);
      expect(res.body.allocations.length).toBe(2);
    });

    it('returns bounded gas price guidance', async () => {
      const { token } = await registerUser('gas');
      const res = await authed(token).get('/api/financial/gas-price');
      expect(res.status).toBe(200);
      expect(res.body.unit).toBe('gwei');
      expect(Array.isArray(res.body.history)).toBe(true);
    });

    it('creates a batch operation with estimated savings', async () => {
      const { token } = await registerUser('batch-create');
      const res = await authed(token).post('/api/financial/batch').send({
        operations: [
          { type: 'transfer', amount: 5 },
          { type: 'approve', amount: 10 }
        ]
      });

      expect(res.status).toBe(201);
      expect(res.body.batch.actualSavings).toBeGreaterThan(0);
    });

    it('lists stored batches', async () => {
      const { token } = await registerUser('batch-list');
      await authed(token).post('/api/financial/batch').send({
        operations: [{ type: 'transfer', amount: 1 }]
      });

      const res = await authed(token).get('/api/financial/batches');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
    });

    it('aggregates savings metrics', async () => {
      const { token } = await registerUser('savings');
      await authed(token).post('/api/financial/batch').send({
        operations: [{ type: 'transfer', amount: 1 }, { type: 'swap', amount: 2 }]
      });

      const res = await authed(token).get('/api/financial/savings');
      expect(res.status).toBe(200);
      expect(res.body.totalSavings).toBeGreaterThan(0);
      expect(res.body.batchedOperations).toBe(2);
    });

    it('reads and updates safety configuration', async () => {
      const { token } = await registerUser('safety');
      const read = await authed(token).get('/api/financial/safety');
      expect(read.status).toBe(200);
      expect(read.body.safetyLevel).toBeCloseTo(BRIDGING_BASELINE, 3);

      const update = await authed(token).post('/api/financial/safety').send({ safetyLevel: 0.75 });
      expect(update.status).toBe(200);
      expect(update.body.safetyLevel).toBe(0.75);
    });
  });

  describe('smart contract and metrics endpoints', () => {
    it('creates a smart contract record', async () => {
      const { token } = await registerUser('contract-create');
      const res = await authed(token).post('/api/financial/contract').send({
        contractName: 'TreasuryManager',
        address: '0x1234567890123456789012345678901234567890',
        chain: 'ethereum',
        abi: ['function distribute()']
      });

      expect(res.status).toBe(201);
      expect(res.body.contract.contractName).toBe('TreasuryManager');
    });

    it('lists smart contracts', async () => {
      const { token } = await registerUser('contract-list');
      await authed(token).post('/api/financial/contract').send({
        contractName: 'TreasuryManager',
        address: '0x1234567890123456789012345678901234567890'
      });

      const res = await authed(token).get('/api/financial/contracts');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
    });

    it('simulates smart contract execution and stores the latest state', async () => {
      const { token } = await registerUser('contract-execute');
      const created = await authed(token).post('/api/financial/contract').send({
        contractName: 'TreasuryManager',
        address: '0x1234567890123456789012345678901234567890'
      });

      const res = await authed(token).post(`/api/financial/contract/${created.body.contract.id}/execute`).send({
        method: 'distribute',
        args: [10]
      });

      expect(res.status).toBe(200);
      expect(res.body.contract.state.lastAction).toBe('distribute');
    });

    it('returns combined financial metrics', async () => {
      const { token } = await registerUser('metrics');
      const wallet = await createWalletForUser(token);
      await authed(token).post('/api/financial/transaction').send({
        walletId: wallet.body.wallet.id,
        to: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        amount: 5
      });
      await authed(token).post('/api/financial/batch').send({
        operations: [{ type: 'transfer', amount: 3 }]
      });

      const res = await authed(token).get('/api/financial/metrics');
      expect(res.status).toBe(200);
      expect(res.body.transactions.verified).toBe(1);
      expect(res.body.optimization.batchCount).toBe(1);
    });
  });

  describe('session completion tracking', () => {
    it('records a session completion report with an end marker', async () => {
      const { token } = await registerUser('session-complete');
      const res = await authed(token).post('/api/session/complete').send({
        sessionId: 'task-123',
        filesModified: 4,
        testsPassing: 22,
        vulnerabilitiesFixed: 0,
        metrics: { summary: 'financial hardening complete' }
      });

      expect(res.status).toBe(200);
      expect(res.body.metrics.sessionEndMarker).toBe(true);
    });

    it('lists session completion reports', async () => {
      const { token } = await registerUser('session-list');
      await authed(token).post('/api/session/complete').send({
        sessionId: 'task-456',
        filesModified: 5,
        testsPassing: 24,
        vulnerabilitiesFixed: 0
      });

      const res = await authed(token).get('/api/session/completion-reports');
      expect(res.status).toBe(200);
      expect(res.body.reports).toHaveLength(1);
      expect(res.body.reports[0].status).toBe('completed');
    });
  });
});
