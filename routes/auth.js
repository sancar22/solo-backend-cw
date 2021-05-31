const express = require('express')
const router = express.Router()

const authController = require('../controllers/auth')

router.post('/login', authController.login)

router.post('/register', authController.register)

router.get('/confirmation/:token', authController.verifyEmail)

router.post('/forgotPW', authController.forgotPW)

router.post('/verifyEmailCode', authController.verifyPWCodeChange)

module.exports = router
