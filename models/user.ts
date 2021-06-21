import { Model, Schema, model, ObjectId } from 'mongoose';

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  verified: boolean;
  stripeID: string;
  forgotPWToken: string;
}

const UserSchema = new Schema<User>(
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

const User: Model<User> = model('User', UserSchema);
export default User;
