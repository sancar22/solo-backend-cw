import { ObjectId } from 'mongodb';
import { Model, Schema, model } from 'mongoose';

export interface Topic {
  _id: string,
  enabled: Boolean,
  courseID: string;
  name: string;
  description: string;
  videoURL: string;
  questions: any[];
}

const TopicSchema = new Schema<Topic>(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    courseID: {
      type: ObjectId,
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

const Topic: Model<Topic> = model('Topic', TopicSchema);
export default Topic;
