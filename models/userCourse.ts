import { Decimal128 } from 'bson';
import { ObjectId } from 'mongodb';

import { Model, Schema, model } from 'mongoose';

export interface UserCourse {
  _id: string;
  enabled: boolean;
  userID: string;
  courseID: string;
  coursePricePaid: number;
}

const UserCourseSchema = new Schema<UserCourse>(
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
    coursePricePaid: {
      type: Decimal128,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const UserCourse: Model<UserCourse> = model('UserCourse', UserCourseSchema);
export default UserCourse;
