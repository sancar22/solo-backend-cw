import { Model, Schema, model } from 'mongoose';

export interface Admin {
  _id: string;
  email: string;
  password: string;
  enabled: boolean
}

const AdminSchema = new Schema<Admin>(
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

const Admin: Model<Admin> = model('Admin', AdminSchema);
export default Admin;
