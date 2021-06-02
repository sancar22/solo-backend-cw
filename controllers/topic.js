const Course = require('../models/course');
const Topic = require('../models/topic');
const UserTopic = require('../models/userTopic');

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
    const { questions, videoURL, name, description } = req.body;
    await Topic.updateOne(
      { _id: req.params.id },
      {
        $set: {
          questions,
          videoURL,
          name,
          description,
        },
      }
    );
    res.status(200).send('Topic edited successfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

// Logical delete
exports.deleteTopic = async (req, res) => {
  const topicID = req.params.id;
  try {
    await Topic.updateOne(
      { _id: topicID },
      {
        $set: {
          enabled: false,
        },
      }
    );
    await UserTopic.updateMany({ topicID }, { enabled: false });
    res.status(200).send('Topic deleted succesfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};
