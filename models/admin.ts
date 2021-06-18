import { Model } from 'mongoose';
import mongoose from '../db/db';

export interface Admin {
  _id: string
  email: string;
  password: string;
  enabled: boolean
}

const AdminSchema = new mongoose.Schema<Admin>(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

const Admin: Model<Admin> = mongoose.model('admin', AdminSchema);
export default Admin;
