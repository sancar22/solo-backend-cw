const Stripe = require('stripe');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const UserCourse = require('../models/userCourse');
const defaultConfig = require('../db/default.json');

const stripe = new Stripe(defaultConfig.secretAPITestStripe, {
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

    // const invoiceItem = await stripe.invoiceItems.create({
    //   customer: userStripeID,
    //   price: course.priceStripeID,
    // });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: course.formattedPrice * 100,
      currency: 'usd',
      payment_method_types: ['card'],
      payment_method: paymentMethod.id,
      customer: userStripeID,
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

// await UserCourse.create({
//   userID,
//   courseID: course._id,
//   coursePricePaid: 0,
// });
