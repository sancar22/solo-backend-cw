import { Decimal128 } from 'bson';

import { Model } from 'mongoose';
import mongoose from '../db/db';

export interface Course {
  enabled: string;
  name: string;
  price: Decimal128;
  coverImageURL: string;
  description: string;
  priceStripeID: string;
}

const CourseSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Decimal128,
      required: true,
    },
    coverImageURL: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priceStripeID: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Course: Model<Course> = mongoose.model('course', CourseSchema);
export default Course;