const express = require('express')
const router = express.Router()

const userController = require('../controllers/user')
const authMiddleware = require('../middleware/auth')

router.get('/getInfo', authMiddleware, userController.getInfo)

module.exports = router
