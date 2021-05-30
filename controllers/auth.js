const User = require('../models/user')
const bcrypt = require('bcryptjs')
const defaultConfig = require('../db/default.json');
const {validateEmail} = require('../utils/index');

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

exports.register = async (req, res) => {
  try {
    const { email=email.trim().toLowerCase(), password=password.trim(), passwordRepeat=passwordRepeat.trim() } = req.body
    // Backend validation just in case
    if (!validateEmail(email)) {
      return res.status(400).send('Email is not valid!');
    }
    const user = await User.findOne({email});
    if (user) {
      return res.status(409).send("User already exists!")
    }
    if (password.length<6) {
      return res.status(400).send("Password should be at least 6 characters long!");
    }
    if (password !== passwordRepeat) {
      return res.status(400).send("Passwords don't match!");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await User.create({email, password: hashedPassword})
    res.send("User created successfully!");
  } catch (e) {
    res.status(500).send('Internal Server Error!')
  }
}
