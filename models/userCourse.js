const mongoose = require('mongoose');
const { Decimal128 } = require('bson');
const { ObjectID } = require('mongodb');

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

const UserCourse = mongoose.model('usercourse', UserCourseSchema);
module.exports = UserCourse;
