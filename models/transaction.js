const mongoose = require('mongoose')
const { Decimal128 } = require('bson')
const { ObjectID } = require('mongodb')

const TransactionSchema = new mongoose.Schema(
  {
    userID: {
      type: ObjectID,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    courseID: {
      type: ObjectID,
      required: true,
    },
    price: {
      type: Decimal128,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

const Transaction = mongoose.model('transaction', TransactionSchema)
module.exports = Transaction
