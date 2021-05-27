const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    created: {
      type: String,
      default: new Date().toString(),
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

const User = mongoose.model('user', UserSchema)
module.exports = User
