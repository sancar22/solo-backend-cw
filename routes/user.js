const express = require("express");
const router = express.Router();

const userController = require('../controllers/user');

router.get('/', userController.getInfo);

module.exports = router;