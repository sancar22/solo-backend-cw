import Stripe from 'stripe';
import User from '../models/user';
import Transaction from '../models/transaction';
import UserCourse from '../models/userCourse';
import Course from '../models/course';

const { secretAPITestStripe } = process.env;
const secret = `${secretAPITestStripe}`;

const stripe = new Stripe(secret, {
  apiVersion: '2020-08-27',
});

exports.payPremiumCourse = async (req, res) => {
  try {
    const userID = req.user.id;
    const { course, creditCardDetails } = req.body;
    const user = await User.findById(userID);
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

    await Transaction.create({
      userID,
      userEmail: user.email,
      courseID: course._id,
      price: course.formattedPrice,
    });

    res.status(200).send('Enrolled succesfully!');
  } catch (e) {
    res.status(500).json({ errors: e });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    const transactions = await Transaction.find().lean();
    if (!transactions) return res.send('No transactions are available!');
    for (let i = 0; i < transactions.length; i++) {
      const course = await Course.findById(transactions[i].courseID);
      transactions[i].courseName = course.name;
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
      allInfo: transactions,
      tableOptions,
      entityName,
      categoryName,
    });
  } catch (e) {
    res.status(500).json({ errors: e });
  }
};

exports.getPurchaseById = async (req, res) => {
  try {
    console.log('entering');
    const transaction = await Transaction.findById(req.params.id).lean();

    if (!transaction) return res.send('Transaction not available.');
    const course = await Course.findById(transaction.courseID);
    transaction.courseName = course.name;
    transaction.price = parseFloat(transaction.price.toString());
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
      allInfo: transaction,
      tableOptions,
      entityName,
      categoryName,
    });
  } catch (e) {
    res.status(500).json({ errors: e });
  }
};
