const User = require('../models/user')

exports.getInfo = async (req, res) => {
  try {
    const userID = req.user.id
    const user = await User.findById(userID).select({ name: 1 }).lean()
    delete user._id
    res.status(200).send(user)
  } catch (e) {
    res.send('Internal Server Error!')
    res.status(500)
  }
}
