const express = require('express');

const router = express.Router();

const paymentController = require('../controllers/payment');
const authMiddleware = require('../middleware/auth');

router.post(
  '/course/premium',
  authMiddleware,
  paymentController.payPremiumCourse
);

module.exports = router;
