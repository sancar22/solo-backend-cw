const Stripe = require('stripe');
const Course = require('../models/course');
const Topic = require('../models/topic');
const UserCourse = require('../models/userCourse');
const UserTopic = require('../models/userTopic');
const uploadFile = require('../functions/uploadFile');

require('dotenv').config();

const stripe = new Stripe(process.env.secretAPITestStripe, {
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
    // this is for dropdown in admin when chosing a grade for the creation of a topic
    const modifiedCourse = [];
    for (let i = 0; i < courses.length; i++) {
      const { name, _id } = courses[i];
      modifiedCourse.push({ title: name, value: _id });
    }
    const tableOptions = { show: true, edit: true, delete: true };
    const entityName = 'course';
    const categoryName = 'Course';

    res.status(200).send({
      keysLabel: filteredKeys,
      allInfo: courses,
      tableOptions,
      entityName,
      categoryName,
      modifiedCourse,
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

    if (!course) return res.send('Course does not exist!');
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

exports.enrollFreeCourse = async (req, res) => {
  try {
    const { course } = req.body;
    const userID = req.user.id;
    await UserCourse.create({
      userID,
      courseID: course._id,
      coursePricePaid: 0,
    });
    res.status(200).send('Enrolled succesfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

exports.enrollPremiumCourse = async (req, res) => {
  try {
    const { course } = req.body;
    const userID = req.user.id;
    await UserCourse.create({
      userID,
      courseID: course._id,
      coursePricePaid: 0,
    });
    res.status(200).send('Enrolled succesfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

exports.getActivitiesClientSide = async (req, res) => {
  try {
    const userID = req.user.id;
    const userActiveCourses = await UserCourse.find({ userID, enabled: true });
    const allAvailableCourses = await Course.find({ enabled: true }).lean();

    const isMyCourse = (courseID) =>
      userActiveCourses.filter(
        (course) => course.courseID.toString() === courseID.toString()
      ).length === 1;

    for (let i = 0; i < allAvailableCourses.length; i++) {
      const currentCourse = allAvailableCourses[i];
      currentCourse.enrolled = false;
      currentCourse.free = false;
      currentCourse.formattedPrice = parseFloat(
        parseFloat(currentCourse.price.toString()).toFixed(2)
      );
      if (isMyCourse(currentCourse._id)) {
        currentCourse.enrolled = true;
      }
      if (currentCourse.formattedPrice === 0) {
        currentCourse.free = true;
      }
    }

    allAvailableCourses.sort((course) => (course.enrolled ? -1 : 1));

    res.status(200).send(allAvailableCourses);
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

exports.getMyCourses = async (req, res) => {
  try {
    const userID = req.user.id;
    const userActiveCourses = await UserCourse.find({
      userID,
      enabled: true,
    }).lean();

    for (let i = 0; i < userActiveCourses.length; i++) {
      const currentCourse = userActiveCourses[i];
      const topicsFromCourse = await Topic.find({
        courseID: currentCourse.courseID,
        enabled: true,
      });
      const topicsCompleted = await UserTopic.find({
        courseID: currentCourse.courseID,
        enabled: true,
        userID,
      });
      const course = await Course.findById(currentCourse.courseID);
      currentCourse.topicsCompleted = topicsCompleted.length;
      currentCourse.numberOfTopics = topicsFromCourse.length;
      currentCourse.name = course.name;
      currentCourse.coverImageURL = course.coverImageURL;
      currentCourse.ratioFinished = parseFloat(
        (topicsCompleted.length / topicsFromCourse.length).toFixed(2)
      );
    }
    res.status(200).send(userActiveCourses);
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};
