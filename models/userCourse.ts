import { Decimal128 } from 'bson';
import { ObjectID } from 'mongodb';

import { Model, Schema, model, ObjectId } from 'mongoose';

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

const UserCourse: Model<UserCourse> = model('usercourse', UserCourseSchema);
export default UserCourse;
