import { Router } from 'express';
import {
  login,
  register,
  verifyEmail,
  verifyPWCodeChange,
  changePassword,
  loginAdmin,
  changePasswordInApp,
  forgotPW } from '../controllers/auth';
import authMiddleware from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/confirmation/:token', verifyEmail);
router.post('/forgotPW', forgotPW);
router.post('/verifyEmailCode', verifyPWCodeChange);
router.post('/changePW', authMiddleware, changePassword);
router.post('/admin/login', loginAdmin);
router.post(
  '/changePWInApp',
  authMiddleware,
  changePasswordInApp
);

export default router;
