const User = require('../models/user')
const bcrypt = require('bcryptjs')
const defaultConfig = require('../db/default.json');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).send('Invalid username or password!')
    const hashedUserPW = user.password
    const isMatch = await bcrypt.compare(password, hashedUserPW)
    if (!isMatch) return res.status(401).send('Invalid username or password!')

    const userPayload = {
      user: {
        id: user._id
      }
    }
    
    jwt.sign(
      userPayload,
      defaultConfig.jwtSecret,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err
        res.status(200).json({ token })
      },
    )
  } catch (e) {
    res.status(500).send('Internal Server Error!')
  }
}
