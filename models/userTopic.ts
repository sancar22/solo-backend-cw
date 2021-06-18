import { ObjectID } from 'mongodb');
import { Decimal128 } from 'bson');

import { Model } from 'mongoose';
import mongoose from '../db/db';

export interface UserTopic {
  enabled: boolean;
  userID: ObjectID;
  courseID: ObjectID;
  topicID: ObjectID;
  score: Decimal128;
  responses: string[];
  totalQuestions: number;
  correctQuestions: number;
}

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

const UserTopic: Model<UserTopic> = mongoose.model('usertopic', UserTopicSchema);
export default UserTopic;

const UserTopic = mongoose.model('usertopic', UserTopicSchema);
module.exports = UserTopic;
