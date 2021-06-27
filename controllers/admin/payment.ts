import { Request, Response } from 'express';
import TransactionModel, { Transaction } from '../../models/transaction';

import CourseModel from '../../models/course';

interface ClientTransaction extends Transaction {
  courseName: string;
}

const getPurchases = async (req: Request, res: Response): Promise<void|Response> => {
  try {
    const transactions = await TransactionModel.find().lean();
    if (!transactions) return res.send('No transactions are available!');

    const clientTransactions: ClientTransaction[] = [];
    for (let i = 0; i < transactions.length; i++) {
      const course = await CourseModel.findById(transactions[i].courseID);
      if (course) {
        const currentTransaction = { ...transactions[i], courseName: course.name };
        clientTransactions.push(currentTransaction);
      }
    }
    const filteredKeys = [
      {
        field: 'courseName',
        headerName: 'Course',
        type: 'string',
        required: true,
      },
      {
        field: 'userEmail',
        headerName: 'Email',
        type: 'string',
        required: true,
      },
      {
        field: 'price',
        headerName: 'Price Paid',
        type: 'string',
        required: true,
      },
      { field: 'options', headerName: 'Options' },
    ];
    const tableOptions = { show: true, edit: false, delete: false };
    const entityName = 'purchase';
    const categoryName = 'Purchase';

    res.status(200).send({
      keysLabel: filteredKeys,
      allInfo: clientTransactions,
      tableOptions,
      entityName,
      categoryName,
    });
  } catch (e) {
    res.status(500).json({ errors: e });
  }
};

const getPurchaseById = async (req: Request, res: Response): Promise<void|Response> => {
  try {
    const transaction = await TransactionModel.findById(req.params.id).lean();
    if (!transaction) return res.send('Transaction not available.');
    const course = await CourseModel.findById(transaction.courseID);
    if (course) {
      const clientTransaction: ClientTransaction = {
        ...transaction,
        courseName: course.name,
        price: parseFloat(transaction.price.toString()),
      };

      const filteredKeys = [
        {
          field: 'courseName',
          headerName: 'Course',
          type: 'string',
          required: true,
        },
        {
          field: 'userEmail',
          headerName: 'Email',
          type: 'string',
          required: true,
        },
        {
          field: 'price',
          headerName: 'Price Paid',
          type: 'currency',
          required: true,
        },
        { field: 'options', headerName: 'Options' },
      ];
      const tableOptions = { show: true, edit: false, delete: false };
      const entityName = 'purchase';
      const categoryName = 'Purchase';

      res.status(200).send({
        keysLabel: filteredKeys,
        allInfo: clientTransaction,
        tableOptions,
        entityName,
        categoryName,
      });
    } else {
      res.status(404).send('course not found');
    }
  } catch (e) {
    res.status(500).json({ errors: e });
  }
};

export default {
  getPurchases, getPurchaseById,
};
