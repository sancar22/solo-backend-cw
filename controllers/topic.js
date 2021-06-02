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
exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.aggregate([
      {
        $match: {
          enabled: true,
        },
      },
      {
        $lookup: {
          from: 'courses',
          let: { courseID: '$courseID' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$courseID'],
                },
              },
            },
            {
              $project: {
                name: 1,
              },
            },
          ],
          as: 'courseInfo',
        },
      },
      {
        $addFields: {
          courseName: { $arrayElemAt: ['$courseInfo', 0] },
        },
      },
      {
        $addFields: {
          courseName: '$courseName.name',
        },
      },
    ]);
    if (!topics) return res.send('No topics are available!');
    const filteredKeys = [
      {
        field: 'courseName',
        headerName: 'Course Name',
        type: 'string',
        required: true,
      },
      {
        field: 'name',
        headerName: 'Topic Name',
        type: 'string',
        required: true,
      },
      {
        field: 'description',
        headerName: 'Description',
        type: 'string',
        required: true,
      },
      {
        field: 'videoURL',
        headerName: 'Video',
        type: 'string',
        required: true,
      },
      { field: 'options', headerName: 'Options' },
    ];
    const tableOptions = { show: true, edit: true, delete: true };
    const entityName = 'topic';
    const categoryName = 'Topic';

    res.status(200).send({
      keysLabel: filteredKeys,
      allInfo: topics,
      tableOptions,
      entityName,
      categoryName,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

exports.getTopicsById = async (req, res) => {
  try {
    const topic = await Topic.findOne({
      _id: req.params.id,
      enabled: true,
    }).lean();
    const course = await Course.findById(topic.courseID);
    topic.courseName = course.name;

    if (!topic) return res.send('Topic does not exist!');
    const filteredKeys = [
      {
        field: 'courseName',
        headerName: 'Course Name',
        type: 'string',
        required: true,
      },
      {
        field: 'name',
        headerName: 'Topic Name',
        type: 'string',
        required: true,
      },
      {
        field: 'description',
        headerName: 'Description',
        type: 'string',
        required: true,
      },
      {
        field: 'videoURL',
        headerName: 'Video',
        type: 'string',
        required: true,
      },
      {
        field: 'questions',
        headerName: 'Questions',
        type: 'array',
        required: true,
      },
      { field: 'options', headerName: 'Options' },
    ];
    const tableOptions = { show: true, edit: true, delete: true };
    const entityName = 'topic';
    const categoryName = 'Topic';

    res.status(200).send({
      keysLabel: filteredKeys,
      allInfo: topic,
      tableOptions,
      entityName,
      categoryName,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

exports.addTopic = async (req, res) => {
  try {
    await Topic.create(req.body);
    res.status(200).send('Topic added succesfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

exports.editTopic = async (req, res) => {
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
exports.deleteTopic = async (req, res) => {
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
