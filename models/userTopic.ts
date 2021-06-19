import { ObjectID } from 'mongodb';
import { Decimal128 } from 'bson';

import { Model, Schema, model } from 'mongoose';

export interface UserTopic {
  _id: string;
  enabled: boolean;
  userID: string;
  courseID: string;
  topicID: string;
  score: number;
  responses: string[];
  totalQuestions: number;
  correctQuestions: number;
}

const UserTopicSchema = new Schema<UserTopic>(
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



const UserTopic: Model<UserTopic> = model('usertopic', UserTopicSchema);
export default UserTopic;

