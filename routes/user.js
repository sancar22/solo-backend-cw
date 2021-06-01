const express = require('express')
const router = express.Router()

const userController = require('../controllers/user')
const authMiddleware = require('../middleware/auth')
const authAdminMiddleware = require('../middleware/admin')

router.get('/getInfo', authMiddleware, userController.getInfo)

router.get(
  '/admin/getAllUsers',
  authMiddleware,
  authAdminMiddleware,
  userController.getAllUsers,
)

router.get(
  '/admin/getUserById/:id',
  authMiddleware,
  authAdminMiddleware,
  userController.getUserById,
)

module.exports = router
