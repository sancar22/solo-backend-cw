const mongoose = require('mongoose');
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
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const UserCourse = mongoose.model('usercourse', UserCourseSchema);
module.exports = UserCourse;
