import { Router } from 'express';
const router = Router();

import {
  payPremiumCourse,
  getPurchases,
  getPurchaseById
} from '../controllers/payment';
import authMiddleware from '../middleware/auth';
import authAdminMiddleware from '../middleware/admin';

router.post(
  '/course/premium',
  authMiddleware,
  payPremiumCourse
);

router.get(
  '/admin/purchases',
  authMiddleware,
  authAdminMiddleware,
  getPurchases
);

router.get(
  '/admin/getPurchaseById/:id',
  authMiddleware,
  authAdminMiddleware,
  getPurchaseById
);
module.exports = router;
