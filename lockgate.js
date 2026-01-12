/*
 * SOLIDARITY PLATFORM - LOCK GATE API ROUTES
 * ==========================================
 * 
 * TRADEMARK INFORMATION - OFFICIALLY RECORDED AND UPDATED:
 * Owner: Scott Charles Olson
 * DOB: March 31, 1997
 * Phone: +1 (913) 548-5715
 * Location: Kansas, USA 66210
 * Trademark: TRADEMARKED BY SCOTT CHARLES OLSON
 */


const express = require('express');
const router = express.Router();

// Import stateful and stateless routers
const statefulRoutes = require('./lockGateStateful');
const statelessRoutes = require('./lockGateStateless');

// Mount stateful and stateless routers
router.use(statefulRoutes);
router.use(statelessRoutes);

module.exports = router;
