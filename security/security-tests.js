/*
 * SOLIDARITY PLATFORM - SECURITY TESTS
 * =====================================
 * 
 * Test suite for security features
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * Repository: https://github.com/CharlyOlson/-Solidarity-Clean
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

const { SecureURLValidator, InputSanitizer } = require('./input-validator');

/**
 * Test URL Validator
 */
function testURLValidator() {
  console.log('\n🧪 Testing URL Validator...\n');
  
  const validator = new SecureURLValidator();
  const tests = [
    {
      name: 'Valid HTTPS URL',
      url: 'https://example.com/path',
      expected: true
    },
    {
      name: 'Valid HTTP URL',
      url: 'http://example.com',
      expected: true
    },
    {
      name: 'JavaScript protocol (should fail)',
      url: 'javascript:alert(1)',
      expected: false
    },
    {
      name: 'Data URI (should fail)',
      url: 'data:text/html,<script>alert(1)</script>',
      expected: false
    },
    {
      name: 'XSS attempt (should fail)',
      url: 'https://example.com/<script>alert(1)</script>',
      expected: false
    },
    {
      name: 'Empty URL (should fail)',
      url: '',
      expected: false
    },
    {
      name: 'Localhost (should fail without option)',
      url: 'http://localhost:3000',
      expected: false
    },
    {
      name: 'Private IP (should fail without option)',
      url: 'http://192.168.1.1',
      expected: false
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = validator.validateURL(test.url);
    const success = result.valid === test.expected;
    
    if (success) {
      console.log(`✅ ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   Expected: ${test.expected}, Got: ${result.valid}`);
      console.log(`   Errors: ${result.errors.join(', ')}`);
      failed++;
    }
  }

  console.log(`\n📊 URL Validator Results: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

/**
 * Test Input Sanitizer
 */
function testInputSanitizer() {
  console.log('\n🧪 Testing Input Sanitizer...\n');
  
  const tests = [
    {
      name: 'Sanitize HTML tags',
      input: '<script>alert(1)</script>Hello',
      method: 'sanitizeHTML',
      expected: 'Hello'
    },
    {
      name: 'Sanitize SQL injection',
      input: "admin'--",
      method: 'sanitizeSQL',
      expected: "admin''--"
    },
    {
      name: 'Sanitize path traversal',
      input: '../../../etc/passwd',
      method: 'sanitizeFilePath',
      expected: 'etcpasswd'
    },
    {
      name: 'Sanitize email',
      input: 'TEST@EXAMPLE.COM',
      method: 'sanitizeEmail',
      expected: 'test@example.com'
    },
    {
      name: 'Reject invalid email',
      input: 'not-an-email',
      method: 'sanitizeEmail',
      expected: ''
    },
    {
      name: 'Sanitize number with min/max',
      input: 150,
      method: 'sanitizeNumber',
      args: [{ min: 0, max: 100 }],
      expected: 100
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    let result;
    if (test.args) {
      result = InputSanitizer[test.method](test.input, ...test.args);
    } else {
      result = InputSanitizer[test.method](test.input);
    }
    
    const success = result === test.expected;
    
    if (success) {
      console.log(`✅ ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}`);
      console.log(`   Expected: "${test.expected}", Got: "${result}"`);
      failed++;
    }
  }

  console.log(`\n📊 Input Sanitizer Results: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

/**
 * Test XSS Prevention
 */
function testXSSPrevention() {
  console.log('\n🧪 Testing XSS Prevention...\n');
  
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert(1)>',
    '<iframe src="javascript:alert(1)">',
    '<svg onload=alert(1)>',
    'javascript:alert(1)',
    '<body onload=alert(1)>',
    '<input onfocus=alert(1) autofocus>',
    '<select onfocus=alert(1) autofocus>',
    '<textarea onfocus=alert(1) autofocus>',
    '<details open ontoggle=alert(1)>'
  ];

  let passed = 0;
  let failed = 0;

  for (const payload of xssPayloads) {
    const sanitized = InputSanitizer.sanitizeHTML(payload);
    
    // Check if dangerous tags are removed
    const dangerous = /<script|<iframe|<svg|<body|<img|onerror|onload|onfocus|javascript:/i.test(sanitized);
    
    if (!dangerous) {
      console.log(`✅ Blocked XSS: ${payload.substring(0, 50)}...`);
      passed++;
    } else {
      console.log(`❌ XSS not fully blocked: ${payload}`);
      console.log(`   Sanitized: ${sanitized}`);
      failed++;
    }
  }

  console.log(`\n📊 XSS Prevention Results: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

/**
 * Test SQL Injection Prevention
 */
function testSQLInjectionPrevention() {
  console.log('\n🧪 Testing SQL Injection Prevention...\n');
  
  const sqlPayloads = [
    "admin'--",
    "' OR '1'='1",
    "'; DROP TABLE users--",
    "admin' OR 1=1--",
    "' UNION SELECT * FROM users--"
  ];

  let passed = 0;
  let failed = 0;

  for (const payload of sqlPayloads) {
    const sanitized = InputSanitizer.sanitizeSQL(payload);
    
    // Check if single quotes are properly escaped
    const singleQuotes = (payload.match(/'/g) || []).length;
    const escapedQuotes = (sanitized.match(/''/g) || []).length;
    
    if (escapedQuotes === singleQuotes) {
      console.log(`✅ SQL injection escaped: ${payload}`);
      passed++;
    } else {
      console.log(`❌ SQL injection not fully escaped: ${payload}`);
      console.log(`   Sanitized: ${sanitized}`);
      failed++;
    }
  }

  console.log(`\n📊 SQL Injection Prevention Results: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

/**
 * Run all security tests
 */
function runAllTests() {
  console.log('═══════════════════════════════════════════════');
  console.log('🔒 SOLIDARITY PLATFORM - SECURITY TEST SUITE');
  console.log('═══════════════════════════════════════════════');

  const results = {
    urlValidator: testURLValidator(),
    inputSanitizer: testInputSanitizer(),
    xssPrevention: testXSSPrevention(),
    sqlInjectionPrevention: testSQLInjectionPrevention()
  };

  // Calculate totals
  const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
  const totalTests = totalPassed + totalFailed;

  console.log('═══════════════════════════════════════════════');
  console.log('📊 OVERALL RESULTS');
  console.log('═══════════════════════════════════════════════');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${totalPassed} (${((totalPassed/totalTests)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${totalFailed} (${((totalFailed/totalTests)*100).toFixed(1)}%)`);
  console.log('═══════════════════════════════════════════════\n');

  return {
    success: totalFailed === 0,
    results,
    summary: { totalTests, totalPassed, totalFailed }
  };
}

// Run tests if executed directly
if (require.main === module) {
  const result = runAllTests();
  process.exit(result.success ? 0 : 1);
}

module.exports = {
  runAllTests,
  testURLValidator,
  testInputSanitizer,
  testXSSPrevention,
  testSQLInjectionPrevention
};
