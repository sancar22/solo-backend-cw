import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import authAdminMiddleware from '../middleware/admin';
import adminController from '../controllers/admin/stats';

const router = Router();

router.get(
  '/admin/global',
  authMiddleware,
  authAdminMiddleware,
  adminController.getGlobalStats
);

router.get(
  '/admin/getAllTestResults',
  authMiddleware,
  authAdminMiddleware,
  adminController.getAllTestResults
);

router.get(
  '/admin/getTestResults/:id',
  authMiddleware,
  authAdminMiddleware,
  adminController.getTestResultById
);

export default router;
