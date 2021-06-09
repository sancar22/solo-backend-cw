const express = require('express');

const router = express.Router();

const paymentController = require('../controllers/payment');
const authMiddleware = require('../middleware/auth');
const authAdminMiddleware = require('../middleware/admin');

router.post(
  '/course/premium',
  authMiddleware,
  paymentController.payPremiumCourse
);

router.get(
  '/admin/purchases',
  authMiddleware,
  authAdminMiddleware,
  paymentController.getPurchases
);

router.get(
  '/admin/getPurchaseById/:id',
  authMiddleware,
  authAdminMiddleware,
  paymentController.getPurchaseById
);
module.exports = router;
