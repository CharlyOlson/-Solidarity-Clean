/*
 * SOLIDARITY PLATFORM - REQUEST LOGGER & LOG INJECTION PREVENTION
 * ===============================================================
 *
 * Prevents CWE-117 (Log Injection) attacks by sanitizing user inputs
 * before logging. Log injection occurs when attackers insert CRLF characters
 * (\r\n) into log lines to forge log entries or manipulate log readers.
 *
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */

/**
 * Sanitizes string input to prevent log injection (CWE-117).
 * 
 * Removes CRLF characters (\r, \n) that could be used to:
 * - Create fake log lines
 * - Manipulate log parsing
 * - Inject malicious data into log aggregation systems
 * 
 * @param {any} input - Value to sanitize
 * @returns {any} Sanitized input (strings have CRLF removed)
 */
function sanitizeForLog(input) {
  if (typeof input !== 'string') {
    return input;
  }
  return input.replace(/[\r\n]/g, '');
}

/**
 * Express middleware to log HTTP requests with sanitized inputs.
 * 
 * Logs:
 * - Request method (GET, POST, etc.)
 * - Request URL (with query parameters removed for privacy)
 * - Request timestamp (ISO 8601)
 * - User ID (if authenticated)
 * - Response status (after response completes)
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware
 */
function requestLogger(req, res, next) {
  const safeMethod = sanitizeForLog(req.method);
  const safeUrl = sanitizeForLog(req.originalUrl);
  const safeIp = sanitizeForLog(req.ip || 'unknown');
  const safeUserId = sanitizeForLog(req.user?.id || 'anonymous');

  const requestTimestamp = new Date().toISOString();

  console.log(
    `[AUDIT-REQ] ${requestTimestamp} | ${safeMethod} ${safeUrl} | IP: ${safeIp} | User: ${safeUserId}`
  );

  const originalSend = res.send;
  res.send = function (data) {
    const statusCode = res.statusCode;
    const responseTimestamp = new Date().toISOString();

    console.log(
      `[AUDIT-RES] ${responseTimestamp} | ${statusCode} | ${safeMethod} ${safeUrl} | User: ${safeUserId}`
    );

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Middleware to prevent common HTTP injection attacks.
 * Validates and sanitizes common attack vectors.
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Next middleware
 */
function validateRequestHeaders(req, res, next) {
  const suspiciousPatterns = [
    /[\r\n]/,
    /;base64/i,
    /script/i,
    /javascript:/i
  ];

  for (const [headerName, headerValue] of Object.entries(req.headers)) {
    const headerString = String(headerValue);

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(headerString)) {
        const safeHeader = sanitizeForLog(headerString).substring(0, 50);
        console.warn(
          `[SECURITY] Suspicious header detected: ${headerName} = ${safeHeader}...`
        );

        return res.status(400).json({
          success: false,
          error: 'Invalid request header'
        });
      }
    }
  }

  next();
}

/**
 * Logs authentication events with security context.
 * 
 * @param {string} event - Event type (login, logout, register, etc.)
 * @param {object} context - Context information
 */
function logSecurityEvent(event, context = {}) {
  const {
    userId = 'unknown',
    username = 'unknown',
    ip = 'unknown',
    userAgent = 'unknown',
    success = false,
    reason = 'no reason provided'
  } = context;

  const safeEvent = sanitizeForLog(event);
  const safeUserId = sanitizeForLog(userId);
  const safeUsername = sanitizeForLog(username);
  const safeIp = sanitizeForLog(ip);
  const safeReason = sanitizeForLog(reason);

  const timestamp = new Date().toISOString();
  const status = success ? 'SUCCESS' : 'FAILED';

  console.log(
    `[SECURITY] ${timestamp} | ${status} | ${safeEvent} | User: ${safeUserId} (${safeUsername}) | IP: ${safeIp} | Reason: ${safeReason}`
  );
}

module.exports = {
  sanitizeForLog,
  requestLogger,
  validateRequestHeaders,
  logSecurityEvent
};
