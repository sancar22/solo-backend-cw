const mongoose = require('mongoose')
const { Decimal128 } = require('bson')

const CourseSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Decimal128,
      required: true,
    },
    coverImageURL: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

const Course = mongoose.model('course', CourseSchema)
module.exports = Course
