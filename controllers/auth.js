const User = require('../models/user')
const bcrypt = require('bcryptjs')
const defaultConfig = require('../db/default.json')
const { validateEmail } = require('../utils/index')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const Stripe = require('stripe')
const stripe = new Stripe(defaultConfig.secretAPITestStripe, {
  apiVersion: '2020-08-27',
})

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).send('Invalid username or password!')
    const hashedUserPW = user.password
    const isMatch = await bcrypt.compare(password, hashedUserPW)
    if (!isMatch) return res.status(401).send('Invalid username or password!')
    if (!user.verified)
      return res.status(401).send('You need to verify your account!')

    const userPayload = {
      user: {
        id: user._id,
      },
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
    const {
      email = email.trim().toLowerCase(),
      password = password.trim(),
      passwordRepeat = passwordRepeat.trim(),
    } = req.body
    // Backend validation just in case
    if (!validateEmail(email)) {
      return res.status(400).send('Email is not valid!')
    }
    const user = await User.findOne({ email })
    if (user) {
      return res.status(409).send('User already exists!')
    }
    if (password.length < 6) {
      return res
        .status(400)
        .send('Password should be at least 6 characters long!')
    }
    if (password !== passwordRepeat) {
      return res.status(400).send("Passwords don't match!")
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const customer = await stripe.customers.create({ name: email })
    const newUser = await User.create({
      email,
      password: hashedPassword,
      stripeID: customer.id,
    })

    const payload = {
      user: {
        id: newUser._id,
      },
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: defaultConfig.emailProvider,
        pass: defaultConfig.emailPW,
      },
    })

    jwt.sign(
      payload,
      defaultConfig.jwtSecret,
      { expiresIn: 3600 },
      async (err, token) => {
        if (err) throw err
        res.send('User created successfully!')
        const output = `
        <h2>Please click on the following link to verify your account.</h2>
        <p>${defaultConfig.serverURL}/auth/confirmation/${token}</p>
        <p><b>NOTE: </b> Link will expire in one (1) hour.</p>
        `
        await transporter.sendMail({
          to: email,
          subject: 'Account Verfication - Brand X',
          html: output,
        })
      },
    )
  } catch (e) {
    console.log(e)
    res.status(500).send('Internal Server Error!')
  }
}

exports.verifyEmail = async (req, res) => {
  try {
    const decodedJWT = jwt.verify(req.params.token, defaultConfig.jwtSecret)
    const userID = decodedJWT.user.id
    await User.updateOne(
      { _id: userID },
      {
        $set: { verified: true },
      },
    )
    res.status(200).send('Verified successfully!')
  } catch (e) {
    res.status(500).send(e)
  }
}
