import { Model } from 'mongoose';
import mongoose from '../db/db';

export interface User {
  name: string;
  email: string;
  password: string;
  verified: boolean;
  stripeID: string;
  forgotPWToken: string;
}

const UserSchema = new mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    stripeID: {
      type: String,
    },
    forgotPWToken: {
      type: String,
      default: '',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const User: Model<User> = mongoose.model('user', UserSchema);
export default User;
