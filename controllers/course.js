const Stripe = require('stripe');
const Course = require('../models/course');
const Topic = require('../models/topic');
const UserCourse = require('../models/userCourse');
const UserTopic = require('../models/userTopic');
const uploadFile = require('../functions/uploadFile');
const defaultConfig = require('../db/default.json');

const stripe = new Stripe(defaultConfig.secretAPITestStripe, {
  apiVersion: '2020-08-27',
});

// This will give information in a way that can be read by the tables in the admin page
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ enabled: true });
    if (!courses) return res.send('No courses are available!');
    const filteredKeys = [
      {
        field: 'name',
        headerName: 'Name',
        type: 'string',
        required: true,
      },
      {
        field: 'description',
        headerName: 'Description',
        type: 'string',
        required: true,
      },
      { field: 'price', headerName: 'Price', type: 'currency', required: true },
      {
        field: 'coverImageURL',
        headerName: 'Cover Image',
        type: 'image',
        required: true,
      },
      { field: 'options', headerName: 'Options' },
    ];
    const tableOptions = { show: true, edit: true, delete: true };
    const entityName = 'course';
    const categoryName = 'Course';

    res.status(200).send({
      keysLabel: filteredKeys,
      allInfo: courses,
      tableOptions,
      entityName,
      categoryName,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

exports.getCoursesById = async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      enabled: true,
    }).lean();

    if (!course) return res.send('User does not exist!');
    course.price = parseFloat(course.price.toString());
    const filteredKeys = [
      {
        field: 'name',
        headerName: 'Name',
        type: 'string',
        required: true,
      },
      {
        field: 'description',
        headerName: 'Description',
        type: 'string',
        required: true,
      },
      { field: 'price', headerName: 'Price', type: 'currency', required: true },
      {
        field: 'coverImageURL',
        headerName: 'Cover Image',
        type: 'image',
        required: true,
      },
      { field: 'options', headerName: 'Options' },
    ];
    const tableOptions = { show: true, edit: true, delete: true };
    const entityName = 'course';
    const categoryName = 'Course';

    res.status(200).send({
      keysLabel: filteredKeys,
      allInfo: course,
      tableOptions,
      entityName,
      categoryName,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

exports.addCourse = async (req, res) => {
  try {
    let { price } = req.body;
    const { coverImageURL, name, description } = req.body;
    if (!coverImageURL)
      return res.status(400).send('You have to insert a cover image!');
    if (!price) price = 0;

    const { data, mime } = coverImageURL;
    const URLfromS3 = await uploadFile(data, mime);
    const product = await stripe.products.create({
      name: name.trim(),
    });
    const priceStripe = await stripe.prices.create({
      unit_amount: parseInt(price * 100, 10),
      currency: 'usd',
      product: product.id,
    });
    const course = new Course({
      name: name.trim(),
      description: description.trim(),
      price,
      coverImageURL: URLfromS3,
      priceStripeID: priceStripe.id,
    });
    await course.save();
    res.status(200).send('Course added successfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

exports.editCourse = async (req, res) => {
  try {
    let { price } = req.body;
    const { coverImageURL, name, description } = req.body;
    const course = await Course.findOne({
      _id: req.params.id,
      enabled: true,
    }).lean();
    if (!price) price = 0;

    let URLfromS3 = '';
    if (coverImageURL && coverImageURL !== course.coverImageURL) {
      const { data, mime } = coverImageURL;
      URLfromS3 = await uploadFile(data, mime);
    }

    let priceID = course.priceStripedID;
    if (course.price !== price) {
      const product = await stripe.products.create({
        name: name.trim(),
      });
      const priceStripe = await stripe.prices.create({
        unit_amount: parseInt(price * 100, 10),
        currency: 'usd',
        product: product.id,
      });
      priceID = priceStripe.id;
    }
    await Course.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name: name.trim(),
          description: description.trim(),
          coverImageURL: URLfromS3 !== '' ? URLfromS3 : course.coverImageURL,
          price,
          priceStripeID: priceID,
        },
      }
    );

    res.status(200).send('Course edited successfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

// Logical delete
exports.deleteCourse = async (req, res) => {
  const courseID = req.params.id;
  try {
    await Course.updateOne(
      { _id: courseID },
      {
        $set: {
          enabled: false,
        },
      }
    );
    // deleting topics related to course
    await Topic.updateMany({ courseID }, { enabled: false });
    await UserCourse.updateMany({ courseID }, { enabled: false });
    await UserTopic.updateMany({ courseID }, { enabled: false });
    res.status(200).send('Course deleted succesfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};
