import { Router } from 'express';
const router = Router();

import {
  getInfo,
  getAllUsers,
getUserById} from '../controllers/user';
import authMiddleware from '../middleware/auth';
import authAdminMiddleware from '../middleware/admin';

router.get('/getInfo', authMiddleware, getInfo);

router.get(
  '/admin/getAllUsers',
  authMiddleware,
  authAdminMiddleware,
  getAllUsers
);

router.get(
  '/admin/getUserById/:id',
  authMiddleware,
  authAdminMiddleware,
  getUserById
);

module.exports = router;
