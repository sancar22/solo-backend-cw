const jwt = require('jsonwebtoken')
const defaultConfig = require('../db/default.json')
const Admin = require('../models/admin')

module.exports = async function (req, res, next) {
  // Get user id attached by jwt middleware in the request and verify if it's an id of an admin
  const userID = req.user.id
  const isAdmin = await Admin.findById(userID)

  // Check if no token
  if (!isAdmin) {
    return res.status(401).json({ msg: 'Not an admin user!' })
  }
  next()
}
