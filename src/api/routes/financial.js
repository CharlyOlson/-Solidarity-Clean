/*
 * SOLIDARITY PLATFORM - FINANCIAL API ROUTES
 * ==========================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 *
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const crypto = require('crypto');
const express = require('express');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const { stmts } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { PHI, BRIDGING_BASELINE } = require('../../utils/constants');

const router = express.Router();

const VALID_NODES = [1, 3, 4, 7, 14, 21];
const DEFAULT_GAS_PRICE = 20;
const SIGNING_SECRET = process.env.FINANCIAL_KEY_SECRET
  || (process.env.NODE_ENV === 'production' ? null : 'solidarity-financial-signing-dev-only');

if (!SIGNING_SECRET) {
  throw new Error('FINANCIAL_KEY_SECRET must be set in production to encrypt/sign wallet keys');
}

const SAFETY_TIERS = [
  { label: 'emergency', min: 0, max: 0.05, canTransact: false, maxAmount: 0 },
  { label: 'warning', min: 0.05, max: 0.15, canTransact: true, maxAmount: 25 },
  { label: 'caution', min: 0.15, max: 0.25, canTransact: true, maxAmount: 100 },
  { label: 'optimal', min: 0.25, max: 0.75, canTransact: true, maxAmount: 10000 },
  { label: 'upper-caution', min: 0.75, max: 0.85, canTransact: true, maxAmount: 100 },
  { label: 'upper-warning', min: 0.85, max: 0.95, canTransact: true, maxAmount: 25 },
  { label: 'critical-upper', min: 0.95, max: 1.01, canTransact: false, maxAmount: 0 }
];

const financialRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});

router.use(financialRateLimit);
router.use(optionalAuth);

function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${entries.join(',')}}`;
}

function parseJson(value, fallback) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
}

function deriveEncryptionKey() {
  return crypto.createHash('sha256').update(SIGNING_SECRET).digest();
}

function encryptSecret(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', deriveEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
}

function decryptSecret(payload) {
  const [ivB64, authTagB64, encryptedB64] = String(payload).split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    deriveEncryptionKey(),
    Buffer.from(ivB64, 'base64')
  );
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedB64, 'base64')),
    decipher.final()
  ]).toString('utf8');
}

function getSafetyTier(level = BRIDGING_BASELINE) {
  return SAFETY_TIERS.find((tier) => level >= tier.min && level < tier.max) || SAFETY_TIERS[3];
}

function validateSafetyLevel(level, amount = 0) {
  const numericLevel = Number(level);
  if (!Number.isFinite(numericLevel) || numericLevel < 0 || numericLevel > 1) {
    return { valid: false, error: 'Safety level must be between 0 and 1' };
  }

  const tier = getSafetyTier(numericLevel);
  if (!tier.canTransact && amount > 0) {
    return { valid: false, error: `Transactions are blocked in ${tier.label} tier`, tier };
  }

  if (amount > tier.maxAmount) {
    return {
      valid: false,
      error: `Amount exceeds ${tier.label} tier limit of ${tier.maxAmount}`,
      tier
    };
  }

  return { valid: true, tier };
}

function buildWalletMetadata(body = {}) {
  return {
    testMode: body.testMode !== false,
    createdFrom: 'api',
    requestedAddress: body.address || null
  };
}

function buildTransactionPayload(record) {
  return {
    id: record.id,
    userId: record.userId,
    walletId: record.walletId,
    from: record.from,
    to: record.to,
    amount: record.amount,
    chain: record.chain,
    type: record.type,
    status: record.status,
    safetyLevel: record.safetyLevel,
    signerIdentity: record.signerIdentity,
    timestamp: record.timestamp,
    metadata: record.metadata || {}
  };
}

function hashPayload(payload) {
  return crypto.createHash('sha256').update(stableStringify(payload)).digest('hex');
}

function signPayload(payload, encryptedPrivateKey) {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(stableStringify(payload));
  signer.end();
  return signer.sign(decryptSecret(encryptedPrivateKey), 'base64');
}

function verifyPayload(payload, signature, publicKey) {
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(stableStringify(payload));
  verifier.end();
  return verifier.verify(publicKey, signature, 'base64');
}

function buildTransactionRecord(wallet, body, currentStatus = 'executed') {
  const amount = Number(body.amount);
  const metadata = {
    testMode: body.testMode !== false,
    signerIdentity: wallet.signer_identity,
    submittedAt: new Date().toISOString(),
    signedAt: null,
    batchId: body.batchId || null,
    note: body.note || null
  };

  const timestamp = new Date().toISOString();
  metadata.submittedAt = timestamp;
  metadata.signedAt = timestamp;

  return {
    id: body.id || uuidv4(),
    userId: wallet.user_id,
    walletId: wallet.id,
    from: wallet.address,
    to: body.to,
    amount,
    chain: body.chain || wallet.chain,
    type: body.type || 'transfer',
    status: currentStatus,
    safetyLevel: body.safetyLevel ?? wallet.safety_level ?? BRIDGING_BASELINE,
    signerIdentity: wallet.signer_identity,
    timestamp,
    metadata
  };
}

function normalizeWallet(row) {
  return {
    id: row.id,
    userId: row.user_id,
    walletName: row.wallet_name,
    chain: row.chain,
    address: row.address,
    signerIdentity: row.signer_identity,
    safetyLevel: row.safety_level,
    node: row.node,
    balance: row.balance,
    status: row.status,
    metadata: parseJson(row.metadata, {}),
    publicKey: row.public_key,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeTransaction(row) {
  return {
    id: row.id,
    userId: row.user_id,
    walletId: row.wallet_id,
    from: row.from_address,
    to: row.to_address,
    amount: row.amount,
    chain: row.chain,
    type: row.type,
    status: row.status,
    safetyLevel: row.safety_level,
    signerIdentity: row.signer_identity,
    publicKey: row.public_key,
    signature: row.signature,
    transactionHash: row.transaction_hash,
    verificationStatus: Boolean(row.verification_status),
    metadata: parseJson(row.metadata, {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    executedAt: row.executed_at
  };
}

function normalizeAudit(row) {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    userId: row.user_id,
    operation: row.operation,
    transactionHash: row.transaction_hash,
    signature: row.signature,
    signerIdentity: row.signer_identity,
    oldValues: parseJson(row.old_values, null),
    newValues: parseJson(row.new_values, null),
    createdAt: row.created_at
  };
}

function logTransactionAudit(operation, transactionRow, oldValues = null, newValues = null) {
  stmts.insertTransactionAudit.run(
    transactionRow.id,
    transactionRow.user_id,
    operation,
    transactionRow.transaction_hash,
    transactionRow.signature,
    transactionRow.signer_identity,
    oldValues ? JSON.stringify(oldValues) : null,
    newValues ? JSON.stringify(newValues) : null
  );
}

function getUserSafetyLevel(userId) {
  const settings = stmts.getSettings.get(userId);
  return settings?.safety_level ?? BRIDGING_BASELINE;
}

function buildGasResponse(currentSafetyLevel) {
  const tier = getSafetyTier(currentSafetyLevel);
  const gasPrice = Number((DEFAULT_GAS_PRICE * (1 + Math.abs(currentSafetyLevel - BRIDGING_BASELINE))).toFixed(2));
  return {
    gasPrice,
    unit: 'gwei',
    strategy: `${tier.label}-bounded`,
    phiRatio: PHI,
    safetyLevel: currentSafetyLevel,
    tier: tier.label,
    history: [
      Number((gasPrice / PHI).toFixed(2)),
      gasPrice,
      Number((gasPrice * BRIDGING_BASELINE).toFixed(2))
    ]
  };
}

function getWalletOrThrow(walletId, userId) {
  const wallet = stmts.getFinancialWalletById.get(walletId, userId);
  if (!wallet) {
    const error = new Error('Wallet not found');
    error.status = 404;
    throw error;
  }
  return wallet;
}

function getTransactionOrThrow(transactionId, userId) {
  const transaction = stmts.getFinancialTransactionById.get(transactionId, userId);
  if (!transaction) {
    const error = new Error('Transaction not found');
    error.status = 404;
    throw error;
  }
  return transaction;
}

router.get('/portfolio', (req, res, next) => {
  try {
    const wallets = stmts.listFinancialWalletsByUser.all(req.user.id).map(normalizeWallet);
    const transactions = stmts.listFinancialTransactionsByUser.all(req.user.id).map(normalizeTransaction);
    const totalValue = wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0);
    const totalOutflow = transactions
      .filter((transaction) => transaction.status === 'executed')
      .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

    res.json({
      success: true,
      portfolio: {
        totalValue,
        walletCount: wallets.length,
        totalOutflow,
        wallets,
        lastUpdate: new Date().toISOString()
      },
      safetyLevel: getUserSafetyLevel(req.user.id),
      phiRatio: PHI,
      productionWarning: 'Blockchain integration remains test-mode only.'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/optimize', (req, res, next) => {
  try {
    const wallets = stmts.listFinancialWalletsByUser.all(req.user.id).map(normalizeWallet);
    const total = wallets.reduce((sum, wallet) => sum + Number(wallet.balance || 0), 0);
    const allocations = wallets
      .sort((left, right) => right.balance - left.balance)
      .map((wallet, index) => {
        const recommendedShare = index === 0
          ? BRIDGING_BASELINE
          : Number(((1 - BRIDGING_BASELINE) / Math.pow(PHI, index)).toFixed(6));
        return {
          walletId: wallet.id,
          walletName: wallet.walletName,
          currentShare: total > 0 ? Number((wallet.balance / total).toFixed(6)) : 0,
          recommendedShare
        };
      });

    res.json({
      success: true,
      optimized: true,
      allocations,
      phiRatio: PHI,
      safetyLevel: getUserSafetyLevel(req.user.id),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

router.post('/wallet', (req, res, next) => {
  try {
    const safetyLevel = Number(req.body.safetyLevel ?? getUserSafetyLevel(req.user.id));
    const validation = validateSafetyLevel(safetyLevel);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    const node = Number(req.body.node ?? 7);
    if (!VALID_NODES.includes(node)) {
      return res.status(400).json({ success: false, error: 'Node must be one of 1, 3, 4, 7, 14, 21' });
    }

    const walletName = req.body.walletName || req.body.name || `wallet-${Date.now()}`;
    const chain = req.body.chain || 'ethereum';
    const balance = Number(req.body.balance ?? 0);
    const signerIdentity = req.body.signerIdentity || `${req.user.username}:${walletName}`;
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    const id = uuidv4();
    const address = req.body.address || `0x${crypto.randomBytes(20).toString('hex')}`;
    stmts.insertFinancialWallet.run(
      id,
      req.user.id,
      walletName,
      chain,
      address,
      signerIdentity,
      publicKey,
      encryptSecret(privateKey),
      safetyLevel,
      node,
      balance,
      'active',
      JSON.stringify(buildWalletMetadata(req.body))
    );

    const wallet = normalizeWallet(stmts.getFinancialWalletById.get(id, req.user.id));
    res.status(201).json({
      success: true,
      wallet,
      safetyConfig: validation.tier,
      productionWarning: 'Wallets are persisted locally and blockchain writes stay in test mode.'
    });
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, error: 'Wallet name or address already exists for this user' });
    }
    next(error);
  }
});

router.get('/wallets', (req, res, next) => {
  try {
    const wallets = stmts.listFinancialWalletsByUser.all(req.user.id).map(normalizeWallet);
    res.json({
      success: true,
      wallets,
      count: wallets.length,
      safetyLevel: getUserSafetyLevel(req.user.id)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/wallets/:id', (req, res, next) => {
  try {
    const wallet = getWalletOrThrow(req.params.id, req.user.id);
    res.json({ success: true, wallet: normalizeWallet(wallet) });
  } catch (error) {
    next(error);
  }
});

router.post('/transaction', (req, res, next) => {
  try {
    const wallet = getWalletOrThrow(req.body.walletId, req.user.id);
    const amount = Number(req.body.amount);
    if (!req.body.to || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, error: 'walletId, to, and positive amount are required' });
    }

    const safetyLevel = Number(req.body.safetyLevel ?? wallet.safety_level);
    const safetyValidation = validateSafetyLevel(safetyLevel, amount);
    if (!safetyValidation.valid) {
      return res.status(403).json({ success: false, error: safetyValidation.error, tier: safetyValidation.tier?.label });
    }
    if (Number(wallet.balance) < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient wallet balance' });
    }

    const record = buildTransactionRecord(wallet, req.body);
    const transactionHash = hashPayload(buildTransactionPayload(record));
    const signature = signPayload(buildTransactionPayload(record), wallet.private_key);
    const verified = verifyPayload(buildTransactionPayload(record), signature, wallet.public_key);
    const executedAt = record.status === 'executed' ? record.timestamp : null;

    stmts.insertFinancialTransaction.run(
      record.id,
      record.userId,
      record.walletId,
      record.from,
      record.to,
      record.amount,
      record.chain,
      record.type,
      record.status,
      record.safetyLevel,
      record.signerIdentity,
      wallet.public_key,
      signature,
      transactionHash,
      verified ? 1 : 0,
      JSON.stringify(record.metadata),
      executedAt
    );

    stmts.updateFinancialWalletBalance.run(Number(wallet.balance) - amount, wallet.id, req.user.id);

    const transaction = stmts.getFinancialTransactionById.get(record.id, req.user.id);
    logTransactionAudit('CREATE', transaction, null, normalizeTransaction(transaction));

    res.status(201).json({
      success: true,
      transaction: normalizeTransaction(transaction),
      verified,
      tier: safetyValidation.tier.label
    });
  } catch (error) {
    next(error);
  }
});

router.get('/transactions', (req, res, next) => {
  try {
    const status = req.query.status;
    const limit = Math.min(Number(req.query.limit || 50), 200);
    let transactions = stmts.listFinancialTransactionsByUser.all(req.user.id).map(normalizeTransaction);

    if (status) {
      transactions = transactions.filter((transaction) => transaction.status === status);
    }

    res.json({
      success: true,
      transactions: transactions.slice(0, limit),
      count: transactions.length
    });
  } catch (error) {
    next(error);
  }
});

router.get('/transaction/:id', (req, res, next) => {
  try {
    const transaction = getTransactionOrThrow(req.params.id, req.user.id);
    const normalized = normalizeTransaction(transaction);
    const signedAt = normalized.metadata.signedAt || normalized.metadata.submittedAt || normalized.createdAt;
    const verificationStatus = verifyPayload({
      id: normalized.id,
      userId: normalized.userId,
      walletId: normalized.walletId,
      from: normalized.from,
      to: normalized.to,
      amount: normalized.amount,
      chain: normalized.chain,
      type: normalized.type,
      status: normalized.status,
      safetyLevel: normalized.safetyLevel,
      signerIdentity: normalized.signerIdentity,
      timestamp: signedAt,
      metadata: normalized.metadata
    }, normalized.signature, normalized.publicKey);

    res.json({
      success: true,
      transaction: normalized,
      verified: verificationStatus
    });
  } catch (error) {
    next(error);
  }
});

router.get('/transaction/:id/verify', (req, res, next) => {
  try {
    const transaction = normalizeTransaction(getTransactionOrThrow(req.params.id, req.user.id));
    const signedAt = transaction.metadata.signedAt || transaction.metadata.submittedAt || transaction.createdAt;
    const payload = {
      id: transaction.id,
      userId: transaction.userId,
      walletId: transaction.walletId,
      from: transaction.from,
      to: transaction.to,
      amount: transaction.amount,
      chain: transaction.chain,
      type: transaction.type,
      status: transaction.status,
      safetyLevel: transaction.safetyLevel,
      signerIdentity: transaction.signerIdentity,
      timestamp: signedAt,
      metadata: transaction.metadata
    };
    res.json({
      success: true,
      verified: verifyPayload(payload, transaction.signature, transaction.publicKey),
      transactionHashMatches: transaction.transactionHash === hashPayload(payload)
    });
  } catch (error) {
    next(error);
  }
});

router.put('/transaction/:id', (req, res, next) => {
  try {
    const current = getTransactionOrThrow(req.params.id, req.user.id);
    if (current.status === 'deleted') {
      return res.status(400).json({ success: false, error: 'Deleted transactions cannot be modified' });
    }

    const wallet = getWalletOrThrow(current.wallet_id, req.user.id);
    const updatedRecord = buildTransactionRecord(wallet, {
      ...req.body,
      id: current.id,
      to: req.body.to ?? current.to_address,
      amount: req.body.amount ?? current.amount,
      chain: req.body.chain ?? current.chain,
      type: req.body.type ?? current.type,
      safetyLevel: req.body.safetyLevel ?? current.safety_level
    }, req.body.status || current.status);

    const safetyValidation = validateSafetyLevel(updatedRecord.safetyLevel, Number(updatedRecord.amount));
    if (!safetyValidation.valid) {
      return res.status(403).json({ success: false, error: safetyValidation.error, tier: safetyValidation.tier?.label });
    }

    const currentAmount = Number(current.amount);
    const nextAmount = Number(updatedRecord.amount);
    const walletBalance = Number(wallet.balance) + currentAmount - nextAmount;
    if (walletBalance < 0) {
      return res.status(400).json({ success: false, error: 'Insufficient wallet balance for updated transaction amount' });
    }

    const transactionHash = hashPayload(buildTransactionPayload(updatedRecord));
    const signature = signPayload(buildTransactionPayload(updatedRecord), wallet.private_key);
    const verified = verifyPayload(buildTransactionPayload(updatedRecord), signature, wallet.public_key);
    const oldValues = normalizeTransaction(current);
    const metadata = {
      ...parseJson(current.metadata, {}),
      note: req.body.note ?? parseJson(current.metadata, {}).note ?? null,
      signedAt: updatedRecord.timestamp,
      updatedAt: updatedRecord.timestamp
    };

    stmts.updateFinancialTransaction.run(
      updatedRecord.to,
      updatedRecord.amount,
      updatedRecord.type,
      updatedRecord.status,
      updatedRecord.safetyLevel,
      updatedRecord.signerIdentity,
      wallet.public_key,
      signature,
      transactionHash,
      verified ? 1 : 0,
      JSON.stringify(metadata),
      updatedRecord.status === 'executed' ? updatedRecord.timestamp : current.executed_at,
      current.id,
      req.user.id
    );
    stmts.updateFinancialWalletBalance.run(walletBalance, wallet.id, req.user.id);

    const updated = stmts.getFinancialTransactionById.get(current.id, req.user.id);
    logTransactionAudit('UPDATE', updated, oldValues, normalizeTransaction(updated));

    res.json({
      success: true,
      transaction: normalizeTransaction(updated),
      verified
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/transaction/:id', (req, res, next) => {
  try {
    const current = getTransactionOrThrow(req.params.id, req.user.id);
    if (current.status === 'deleted') {
      return res.status(400).json({ success: false, error: 'Transaction already deleted' });
    }

    const wallet = getWalletOrThrow(current.wallet_id, req.user.id);
    const deletedAt = new Date().toISOString();
    const payload = {
      id: current.id,
      userId: current.user_id,
      walletId: current.wallet_id,
      from: current.from_address,
      to: current.to_address,
      amount: current.amount,
      chain: current.chain,
      type: current.type,
      status: 'deleted',
      safetyLevel: current.safety_level,
      signerIdentity: current.signer_identity,
      timestamp: deletedAt,
      metadata: {
        ...parseJson(current.metadata, {}),
        signedAt: deletedAt,
        deleted: true
      }
    };

    const transactionHash = hashPayload(payload);
    const signature = signPayload(payload, wallet.private_key);
    const verified = verifyPayload(payload, signature, wallet.public_key);
    const oldValues = normalizeTransaction(current);

    stmts.updateFinancialTransaction.run(
      current.to_address,
      current.amount,
      current.type,
      'deleted',
      current.safety_level,
      current.signer_identity,
      wallet.public_key,
      signature,
      transactionHash,
      verified ? 1 : 0,
      JSON.stringify(payload.metadata),
      current.executed_at,
      current.id,
      req.user.id
    );
    if (current.status === 'executed') {
      stmts.updateFinancialWalletBalance.run(
        Number(wallet.balance) + Number(current.amount),
        wallet.id,
        req.user.id
      );
    }

    const deleted = stmts.getFinancialTransactionById.get(current.id, req.user.id);
    logTransactionAudit('DELETE', deleted, oldValues, normalizeTransaction(deleted));

    res.json({
      success: true,
      transaction: normalizeTransaction(deleted)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/transaction/:id/audit', (req, res, next) => {
  try {
    getTransactionOrThrow(req.params.id, req.user.id);
    const audit = stmts.listTransactionAuditByTransaction
      .all(req.params.id, req.user.id)
      .map(normalizeAudit);
    res.json({ success: true, audit, count: audit.length });
  } catch (error) {
    next(error);
  }
});

router.get('/gas-price', (req, res, next) => {
  try {
    res.json({
      success: true,
      ...buildGasResponse(getUserSafetyLevel(req.user.id)),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

router.post('/batch', (req, res, next) => {
  try {
    if (!Array.isArray(req.body.operations) || req.body.operations.length === 0) {
      return res.status(400).json({ success: false, error: 'Operations array required' });
    }

    const safetyLevel = Number(req.body.safetyLevel ?? getUserSafetyLevel(req.user.id));
    const validation = validateSafetyLevel(safetyLevel);
    if (!validation.valid) {
      return res.status(403).json({ success: false, error: validation.error });
    }

    const id = uuidv4();
    const estimatedSavings = Number((req.body.operations.length * BRIDGING_BASELINE * PHI).toFixed(4));
    const actualSavings = Number((estimatedSavings * 0.9).toFixed(4));
    stmts.insertFinancialBatch.run(
      id,
      req.user.id,
      req.body.operations.length,
      JSON.stringify(req.body.operations),
      'executed',
      estimatedSavings,
      actualSavings,
      safetyLevel
    );

    res.status(201).json({
      success: true,
      batch: {
        id,
        operationCount: req.body.operations.length,
        operations: req.body.operations,
        status: 'executed',
        estimatedSavings,
        actualSavings,
        safetyLevel
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/batches', (req, res, next) => {
  try {
    const batches = stmts.listFinancialBatchesByUser.all(req.user.id).map((row) => ({
      id: row.id,
      userId: row.user_id,
      operationCount: row.operation_count,
      operations: parseJson(row.operations, []),
      status: row.status,
      estimatedSavings: row.estimated_savings,
      actualSavings: row.actual_savings,
      safetyLevel: row.safety_level,
      createdAt: row.created_at
    }));
    res.json({ success: true, batches, count: batches.length });
  } catch (error) {
    next(error);
  }
});

router.get('/savings', (req, res, next) => {
  try {
    const batches = stmts.listFinancialBatchesByUser.all(req.user.id);
    const totalSavings = batches.reduce((sum, batch) => sum + Number(batch.actual_savings || 0), 0);
    res.json({
      success: true,
      totalSavings,
      gasSavings: Number((totalSavings * BRIDGING_BASELINE).toFixed(4)),
      batchedOperations: batches.reduce((sum, batch) => sum + Number(batch.operation_count), 0),
      localComputations: batches.length,
      phiRatio: PHI
    });
  } catch (error) {
    next(error);
  }
});

router.get('/safety', (req, res, next) => {
  try {
    const safetyLevel = getUserSafetyLevel(req.user.id);
    res.json({
      success: true,
      safetyLevel,
      tier: getSafetyTier(safetyLevel),
      phiRatio: PHI,
      sacredNodes: VALID_NODES,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

router.post('/safety', (req, res, next) => {
  try {
    const current = stmts.getSettings.get(req.user.id);
    const nextLevel = Number(req.body.safetyLevel);
    const validation = validateSafetyLevel(nextLevel);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }

    stmts.upsertSettings.run(
      req.user.id,
      current?.theme ?? 'dark',
      nextLevel,
      current?.notifications ?? 1
    );

    res.json({
      success: true,
      safetyLevel: nextLevel,
      tier: validation.tier
    });
  } catch (error) {
    next(error);
  }
});

router.post('/contract', (req, res, next) => {
  try {
    const { contractName, address, chain = 'ethereum', abi = [], state = {} } = req.body;
    if (!contractName || !address) {
      return res.status(400).json({ success: false, error: 'contractName and address are required' });
    }

    const id = uuidv4();
    stmts.insertSmartContract.run(
      id,
      req.user.id,
      contractName,
      chain,
      address,
      JSON.stringify(abi),
      JSON.stringify({ ...state, lastAction: 'registered' }),
      req.body.testMode === false ? 0 : 1,
      Number(req.body.safetyLevel ?? getUserSafetyLevel(req.user.id))
    );

    res.status(201).json({
      success: true,
      contract: {
        id,
        contractName,
        address,
        chain,
        abi,
        state: { ...state, lastAction: 'registered' },
        testMode: req.body.testMode === false ? false : true
      }
    });
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed')) {
      return res.status(409).json({ success: false, error: 'Contract name already exists for this user' });
    }
    next(error);
  }
});

router.get('/contracts', (req, res, next) => {
  try {
    const contracts = stmts.listSmartContractsByUser.all(req.user.id).map((row) => ({
      id: row.id,
      userId: row.user_id,
      contractName: row.contract_name,
      chain: row.chain,
      address: row.address,
      abi: parseJson(row.abi, []),
      state: parseJson(row.state, {}),
      testMode: Boolean(row.test_mode),
      safetyLevel: row.safety_level
    }));
    res.json({ success: true, contracts, count: contracts.length });
  } catch (error) {
    next(error);
  }
});

router.post('/contract/:id/execute', (req, res, next) => {
  try {
    const contract = stmts.getSmartContractById.get(req.params.id, req.user.id);
    if (!contract) {
      return res.status(404).json({ success: false, error: 'Contract not found' });
    }

    const currentState = parseJson(contract.state, {});
    const nextState = {
      ...currentState,
      lastAction: req.body.method || 'execute',
      args: req.body.args || [],
      result: req.body.result ?? 'simulated-success',
      executedAt: new Date().toISOString()
    };
    stmts.updateSmartContractState.run(JSON.stringify(nextState), contract.id, req.user.id);

    res.json({
      success: true,
      contract: {
        id: contract.id,
        contractName: contract.contract_name,
        state: nextState,
        testMode: Boolean(contract.test_mode)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/metrics', (req, res, next) => {
  try {
    const wallets = stmts.listFinancialWalletsByUser.all(req.user.id);
    const transactions = stmts.listFinancialTransactionsByUser.all(req.user.id);
    const batches = stmts.listFinancialBatchesByUser.all(req.user.id);
    const contracts = stmts.listSmartContractsByUser.all(req.user.id);

    res.json({
      success: true,
      wallets: wallets.length,
      transactions: {
        total: transactions.length,
        verified: transactions.filter((transaction) => transaction.verification_status === 1).length
      },
      optimization: {
        totalSavings: batches.reduce((sum, batch) => sum + Number(batch.actual_savings || 0), 0),
        batchCount: batches.length
      },
      contracts: contracts.length,
      safety: {
        level: getUserSafetyLevel(req.user.id),
        baseline: BRIDGING_BASELINE,
        phiRatio: PHI
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
