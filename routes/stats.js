const express = require('express');

const router = express.Router();

const statsController = require('../controllers/stats');
const authMiddleware = require('../middleware/auth');
const authAdminMiddleware = require('../middleware/admin');

router.get(
  '/admin/global',
  authMiddleware,
  authAdminMiddleware,
  statsController.getGlobalStats
);

router.get(
  '/admin/getAllTestResults',
  authMiddleware,
  authAdminMiddleware,
  statsController.getAllTestResults
);

router.get(
  '/admin/getTestResults/:id',
  authMiddleware,
  authAdminMiddleware,
  statsController.getTestResultById
);

module.exports = router;
