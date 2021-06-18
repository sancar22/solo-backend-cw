import { Decimal128 } from 'bson';

import { Model } from 'mongoose';
import mongoose from '../db/db';

export interface Course {
  _id: string;
  enabled: boolean;
  name: string;
  price: number;
  coverImageURL: string;
  description: string;
  priceStripeID: string;
}

const CourseSchema = new mongoose.Schema<Course>(
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
