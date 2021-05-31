const jwt = require('jsonwebtoken')
const defaultConfig = require('../db/default.json')

module.exports = function (req, res, next) {
  // Get token from header (protected route)
  const token = req.header('x-auth-token')

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' })
  }

  // Verify token

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'))
    req.user = decoded.user
    next()
  } catch (err) {
    res.status(401).json({ ms: 'Token is not valid' })
  }
}
