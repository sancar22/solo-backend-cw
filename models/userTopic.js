const mongoose = require('mongoose');
const { ObjectID } = require('mongodb');
const { Decimal128 } = require('bson');

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
      type: Decimal128,
      required: true,
    },
    responses: {
      type: Array,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctQuestions: {
      type: Number,
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
