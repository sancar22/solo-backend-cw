const mongoose = require('mongoose')
const { ObjectID } = require('mongodb')

const TopicSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    courseID: {
      type: ObjectID,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videoURL: {
      type: String,
      required: true,
    },
    questions: {
      type: Array,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

const Topic = mongoose.model('topic', TopicSchema)
module.exports = Topic
