import { Decimal128 } from 'bson';
import { ObjectID } from 'mongodb';

import { Model } from 'mongoose';
import mongoose from '../db/db';

export interface UserCourse {
  enabled: boolean;
  userID: ObjectID;
  courseID: ObjectID;
  coursePricePaid: Decimal128;
}

const UserCourseSchema = new mongoose.Schema(
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
    coursePricePaid: {
      type: Decimal128,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const UserCourse: Model<UserCourse> = mongoose.model('usercourse', UserCourseSchema);
export default UserCourse;
