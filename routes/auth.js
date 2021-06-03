const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

router.post('/login', authController.login);

router.post('/register', authController.register);

router.get('/confirmation/:token', authController.verifyEmail);

router.post('/forgotPW', authController.forgotPW);

router.post('/verifyEmailCode', authController.verifyPWCodeChange);

router.post('/changePW', authMiddleware, authController.changePassword);

router.post('/admin/login', authController.loginAdmin);

module.exports = router;
