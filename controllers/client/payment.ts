import Stripe from 'stripe';
import { Request, Response } from 'express';
import UserModel from '../../models/user';
import TransactionModel from '../../models/transaction';
<<<<<<< HEAD
import UserCourse from '../../models/userCourse';


const { SECRET_API_TEST_STRIPE } = process.env;
const secret = `${SECRET_API_TEST_STRIPE}`;
=======
import UserCourseModel from '../../models/userCourse';
>>>>>>> bf880b00288dc95ed845fb743ac82e1902c8e273

const secret = String(process.env.secretAPITestStripe);
const stripe = new Stripe(secret, {
  apiVersion: '2020-08-27',
});

// TODO, refactor
const payPremiumCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const userID = res.locals.user.id;
    const { course, creditCardDetails } = req.body;
    const user = await UserModel.findById(userID);

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

      await UserCourseModel.create({
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

export default {
  payPremiumCourse,
};
