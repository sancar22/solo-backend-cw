import { Model } from 'mongoose';
import { Decimal128 } from 'bson';
import { ObjectID } from 'mongodb';

import mongoose from '../db/db';

export interface Transaction {
  userID: ObjectID;
  userEmail: string;
  courseID: ObjectID;
  price: Decimal128;
}

const TransactionSchema = new mongoose.Schema(
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

const Transaction: Model<Transaction> = mongoose.model('transaction', TransactionSchema);
export default Transaction;
