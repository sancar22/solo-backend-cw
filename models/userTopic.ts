import { ObjectId } from 'mongodb';
import { Decimal128 } from 'bson';

import { Model, Schema, model } from 'mongoose';

export interface UserTopic {
  _id: string;
  enabled: boolean;
  userID: string;
  courseID: string;
  topicID: string;
  score: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responses: any[]; // TODO interface the objects in here
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
      type: ObjectId,
      required: true,
    },
    courseID: {
      type: ObjectId,
      required: true,
    },
    topicID: {
      type: ObjectId,
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
  },
);

const UserTopic: Model<UserTopic> = model('UserTopic', UserTopicSchema);
export default UserTopic;
