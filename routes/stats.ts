import { Router } from 'express';
const router = Router();

import {
  getGlobalStats,
  getAllTestResults,
  getTestResultById
} from '../controllers/stats';
import authMiddleware from '../middleware/auth';
import authAdminMiddleware from '../middleware/admin';

router.get(
  '/admin/global',
  authMiddleware,
  authAdminMiddleware,
  getGlobalStats
);

router.get(
  '/admin/getAllTestResults',
  authMiddleware,
  authAdminMiddleware,
  getAllTestResults
);

router.get(
  '/admin/getTestResults/:id',
  authMiddleware,
  authAdminMiddleware,
  getTestResultById
);

module.exports = router;
