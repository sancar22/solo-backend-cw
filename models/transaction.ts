import { Model, Schema, model } from 'mongoose';
import { Decimal128 } from 'bson';
import { ObjectID } from 'mongodb';

export interface Transaction {
  userID: string;
  userEmail: string;
  courseID: string;
  price: number;
}

const TransactionSchema = new Schema<Transaction>(
  {
    userID: {
      type: ObjectID,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    courseID: {
      type: ObjectID,
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
