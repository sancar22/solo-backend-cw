const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false
    },
    stripeID: {
      type: String,
    }
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

const User = mongoose.model('user', UserSchema)
module.exports = User
