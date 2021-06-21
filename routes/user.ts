import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import authAdminMiddleware from '../middleware/admin';
import adminController from '../controllers/admin/user';
import clientController from '../controllers/client/user';

const router = Router();

router.get(
  '/getInfo',
  authMiddleware,
  clientController.getInfo
);

router.get(
  '/admin/getAllUsers',
  authMiddleware,
  authAdminMiddleware,
  adminController.getAllUsers
);

router.get(
  '/admin/getUserById/:id',
  authMiddleware,
  authAdminMiddleware,
  adminController.getUserById
);

export default router;
