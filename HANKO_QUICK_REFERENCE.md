# 🎴 HANKO STAMP QUICK REFERENCE
## One-Page Guide for Developers

**What is Hanko?** Japanese authentication seals (判子/印鑑) adapted for digital security.

---

## 🚀 QUICK START

### **1. Start the Patched Server**
```powershell
node src/api/server_patched.js
```
**URL**: http://localhost:3000

---

## 🔐 AUTHENTICATION FLOW

### **Register New User** (Auto-creates Personal Hanko)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "scotty",
    "email": "scott@solidarity.com",
    "password": "solidarity618"
  }'
```

**Response**:
```json
{
  "success": true,
  "user": { "id": "usr_...", "username": "scotty", ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "hankoStamp": "hanko_usr_12345_abc",
  "message": "Your personal Hanko seal has been created"
}
```

### **Login** (Verifies all Hanko stamps)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "scotty",
    "password": "solidarity618"
  }'
```

---

## 🎴 HANKO STAMP TYPES

| Type | Japanese | Use Case | Security Level |
|------|----------|----------|----------------|
| **Personal** | 個人印 (kojin-in) | Daily operations | LOW |
| **Bank** | 銀行印 (ginkoin) | Financial transactions | MEDIUM |
| **Registered** | 実印 (jitsuin) | Legal documents | HIGH |
| **Company** | 社印 (shain) | Business operations | HIGH |

---

## 📡 API ENDPOINTS

### **Create Additional Hanko Stamp**
```bash
curl -X POST http://localhost:3000/api/hanko/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bank",
    "metadata": { "bankName": "First National" }
  }'
```

### **Sign Data with Hanko**
```bash
curl -X POST http://localhost:3000/api/hanko/sign-data \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": { "document": "Contract terms..." },
    "stampType": "registered"
  }'
```

### **Verify Hanko Imprint**
```bash
curl -X POST http://localhost:3000/api/hanko/verify-imprint \
  -H "Content-Type: application/json" \
  -d '{
    "data": { ... },
    "hankoImprint": { ... }
  }'
```

### **Financial Transaction** (REQUIRES HANKO)
```bash
curl -X POST http://localhost:3000/api/financial/transaction \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-hanko-stamp-id: hanko_usr_123..." \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x123...",
    "to": "0x456...",
    "amount": 50,
    "currency": "USD"
  }'
```

---

## 🛡️ SECURITY LEVELS

| Safety Level | Range | Hanko Operations |
|--------------|-------|------------------|
| **CRITICAL** | 0.00-0.05 | ❌ Blocked |
| **WARNING** | 0.05-0.15 | ⚠️ Read-only |
| **CAUTION** | 0.15-0.25 | ⚠️ Limited |
| **OPTIMAL** | 0.25-0.75 | ✅ Full access |
| **UPPER** | 0.75-1.00 | ⚠️ Rate limited |

**Default**: 0.618 (φ-ratio baseline)

---

## 🔍 VERIFY HANKO STAMP

```javascript
const { HankoStampSecurity } = require('./src/security/hanko_stamp_security.js');
const hanko = new HankoStampSecurity({ safetyLevel: 0.618 });

// Verify stamp
const result = await hanko.verifyHankoStamp('hanko_usr_123...');

if (result.valid) {
  console.log('✅ Hanko verified:', result.stamp);
} else {
  console.log('❌ Invalid:', result.error);
}
```

---

## 🎯 COMMON USE CASES

### **1. User Registration**
```javascript
const { IntegratedAuthManager } = require('./src/security/integrated_auth.js');
const authManager = new IntegratedAuthManager();

const result = await authManager.register({
  username: 'scotty',
  email: 'scott@solidarity.com',
  password: 'solidarity618'
});
// → Personal Hanko created automatically
```

### **2. Sign Document**
```javascript
const signed = await authManager.signDataWithHanko(
  'usr_123',
  { document: 'Contract terms...' },
  'registered' // Use registered seal (jitsuin)
);
// → Data sealed with Hanko imprint
```

### **3. Verify Signature**
```javascript
const verification = await hanko.verifyHankoImprint(signedData);

if (verification.valid) {
  console.log('✅ Signature valid');
  console.log('Signed by:', verification.hankoImprint.username);
  console.log('Stamp type:', verification.hankoImprint.type);
}
```

---

## 📊 HANKO VS TRADITIONAL AUTH

| Feature | Traditional JWT | Hanko + JWT |
|---------|----------------|-------------|
| **Authentication** | Password only | Password + Stamp |
| **Signatures** | Generic | Cultural (Japanese) |
| **Revocation** | Token expiry | Stamp revocation |
| **Audit Trail** | Limited | Full imprint history |
| **Security** | Medium | High (multi-factor) |

---

## 🚨 TROUBLESHOOTING

### **Issue**: "Safety level too low"
**Solution**: Check safety level >= 0.25 for stamp creation

### **Issue**: "Hanko stamp not found"
**Solution**: User must register first (auto-creates personal stamp)

### **Issue**: "Stamp signature mismatch"
**Solution**: Data has been tampered - reject transaction

### **Issue**: "No Hanko imprint found"
**Solution**: Transaction requires `x-hanko-stamp-id` header

---

## 🔐 DEFAULT ADMIN

```
Username: admin
Password: solidarity618
Hanko Stamp: Created on first use
```

⚠️ **CHANGE IN PRODUCTION!**

---

## 📚 DOCUMENTATION

- **Full Guide**: `PATCHES_COMPLETED_SUMMARY.md`
- **Patch List**: `PATCH_PRIORITY_LIST.md`
- **Reality Check**: `HONEST_REALITY_CHECK.md`
- **E:/ Drive**: `E_DRIVE_SYSTEMS_INVENTORY.md`

---

**Created**: December 16, 2025  
**Owner**: Scott Charles Olson  
**Trademark**: TRADEMARKED BY SCOTT CHARLES OLSON
