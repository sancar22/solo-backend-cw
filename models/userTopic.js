const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');

const UserTopicSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    userID: {
      type: ObjectID,
      required: true,
    },
    courseID: {
      type: ObjectID,
      required: true,
    },
    topicID: {
      type: ObjectID,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    question: {
      type: Array,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const UserTopic = mongoose.model('usertopic', UserTopicSchema);
module.exports = UserTopic;
