const mongoose = require('mongoose')
const AdminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

const Admin = mongoose.model('admin', AdminSchema)
module.exports = Admin
