import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import authAdminMiddleware from '../middleware/admin';
import adminController from '../controllers/admin/payment';
import clientController from '../controllers/client/payment';

const router = Router();

router.post(
  '/course/premium',
  authMiddleware,
  clientController.payPremiumCourse,
);

router.get(
  '/admin/purchases',
  authMiddleware,
  authAdminMiddleware,
  adminController.getPurchases,
);

router.get(
  '/admin/getPurchaseById/:id',
  authMiddleware,
  authAdminMiddleware,
  adminController.getPurchaseById,
);

export default router;
