import { Model, Schema, model } from 'mongoose';
import { Decimal128 } from 'bson';
import { ObjectId } from 'mongodb';

export interface Transaction {
  _id: string;
  userID: string;
  userEmail: string;
  courseID: string;
  price: number;
}

const TransactionSchema = new Schema<Transaction>(
  {
    userID: {
      type: ObjectId,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    courseID: {
      type: ObjectId,
      required: true,
    },
    price: {
      type: Decimal128,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Transaction: Model<Transaction> = model('transaction', TransactionSchema);
export default Transaction;
