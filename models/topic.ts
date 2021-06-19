import { ObjectID } from 'mongodb';

import { Model } from 'mongoose';
import mongoose from '../db/db';

export interface Topic {
  _id: string,
  enabled: Boolean,
  courseID: string;
  name: string;
  description: string;
  videoURL: string;
  questions: any[];
}

const TopicSchema = new mongoose.Schema<Topic>(
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
  }
);

const Topic: Model<Topic> = mongoose.model('topic', TopicSchema);
export default Topic;
