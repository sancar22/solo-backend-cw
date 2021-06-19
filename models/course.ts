import { Decimal128 } from 'bson';

import { Model, Schema, model } from 'mongoose';

export interface Course {
  _id: string;
  enabled: boolean;
  name: string;
  price: number;
  coverImageURL: string;
  description: string;
  priceStripeID: string;
}

const CourseSchema = new Schema<Course>(
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

const Course: Model<Course> = model('course', CourseSchema);
export default Course;
