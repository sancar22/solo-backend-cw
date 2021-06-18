import Stripe from 'stripe';
import { Request, Response } from 'express';
import User from '../models/user';
import TransactionModel from '../models/transaction';
import { Transaction } from '../models/transaction';
import UserCourse from '../models/userCourse';
import Course from '../models/course';

const { secretAPITestStripe } = process.env;
const secret = `${secretAPITestStripe}`;

const stripe = new Stripe(secret, {
  apiVersion: '2020-08-27',
});

interface ClientTransaction extends Transaction {
  courseName: string;
}

export const payPremiumCourse = async (req: Request, res: Response) => {
  try {
    const userID = res.locals.user.id;
    const { course, creditCardDetails } = req.body;
    const user = await User.findById(userID);

    if (user) {
      const userStripeID = user.stripeID;
      const [expMonth, expYear] = creditCardDetails.expiry.split('/');
      const number = creditCardDetails.number.split(' ').join('');
      const { cvc } = creditCardDetails;

      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number,
          exp_month: parseInt(expMonth, 10),
          exp_year: parseInt(expYear, 10),
          cvc,
        },
      });
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: userStripeID,
      });

      await stripe.customers.update(userStripeID, {
        invoice_settings: {
          default_payment_method: paymentMethod.id,
        },
      });

      await stripe.invoiceItems.create({
        customer: userStripeID,
        price: course.priceStripeID,
      });

      await UserCourse.create({
        userID,
        courseID: course._id,
        coursePricePaid: course.formattedPrice,
      });

      await TransactionModel.create({
        userID,
        userEmail: user.email,
        courseID: course._id,
        price: course.formattedPrice,
      });

      res.status(200).send('Enrolled succesfully!');
    } else {
      res.status(404).send('User not found');
    }
  } catch (e) {
    res.status(500).json({ errors: e });
  }
};

export const getPurchases = async (req: Request, res: Response) => {
  try {
    const transactions = await TransactionModel.find().lean();
    if (!transactions) return res.send('No transactions are available!');

    const clientTransactions: ClientTransaction[] = []
    for (let i = 0; i < transactions.length; i++) {
      const course = await Course.findById(transactions[i].courseID);
      if (course) {
        const currentTransaction = {...transactions[i], courseName: course.name};
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

export const getPurchaseById = async (req: Request, res: Response) => {
  try {
    console.log('entering');
    const transaction = await TransactionModel.findById(req.params.id).lean();

    if (!transaction) return res.send('Transaction not available.');
    const course = await Course.findById(transaction.courseID);
    if (course) {
      const clientTransaction: ClientTransaction = {...transaction,
        courseName: course.name,
        price: parseFloat(transaction.price.toString())
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
