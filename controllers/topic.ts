import Course from '../models/course';
import Topic from '../models/topic';
import UserTopic from '../models/userTopic';

// This will give information in a way that can be read by the tables in the admin page
export const getAllTopics = async (req, res) => {
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

export const getTopicsById = async (req, res) => {
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

export const addTopic = async (req, res) => {
  try {
    await Topic.create(req.body);
    res.status(200).send('Topic added succesfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const editTopic = async (req, res) => {
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
export const deleteTopic = async (req, res) => {
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

export const getTopicsClientSide = async (req, res) => {
  try {
    const userID = req.user.id;
    const { courseID } = req.params;
    const allTopics = await Topic.find({ courseID, enabled: true }).lean();

    for (let i = 0; i < allTopics.length; i++) {
      const currentTopic = allTopics[i];
      currentTopic.completed = false;
      const userTopic = await UserTopic.findOne({
        topicID: currentTopic._id,
        userID,
        enabled: true,
      });
      if (userTopic) {
        currentTopic.completed = true;
      }
    }
    res.status(200).send(allTopics);
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const getTopicById = async (req, res) => {
  try {
    const { topicID } = req.params;
    const topic = await Topic.findOne({ _id: topicID, enabled: true }).lean();
    for (let i = 0; i < topic.questions.length; i++) {
      topic.questions[i].userAnswer = 0;
      topic.questions[i].userRespondedCorrectly = false;
      if (topic.questions[i].choices[0].correct) {
        topic.questions[i].userRespondedCorrectly = true;
      }
    }
    res.status(200).send(topic);
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const submitTest = async (req, res) => {
  try {
    const userID = req.user.id;
    const { responses, courseID, topicID } = req.body;
    const totalQuestions = responses.length;
    let numberOfCorrectQuestions = 0;
    for (let i = 0; i < responses.length; i++) {
      if (responses[i].userRespondedCorrectly) {
        numberOfCorrectQuestions++;
      }
    }
    const score = parseFloat(
      ((numberOfCorrectQuestions / totalQuestions) * 100).toFixed(2)
    );
    await UserTopic.create({
      userID,
      courseID,
      topicID,
      score,
      responses,
      totalQuestions,
      correctQuestions: numberOfCorrectQuestions,
    });
    let message = '';
    let passed = false;
    if (totalQuestions === numberOfCorrectQuestions) {
      message = 'Congratulations, you got a perfect score!';
      passed = true;
    } else if (score >= 50) {
      message = 'Congratulations, you passed the test!';
      passed = true;
    } else if (score < 50) {
      message =
        'Too bad, you failed the test. You can see what you answered wrong in the course progress!';
    }
    res.send({
      score,
      totalQuestions,
      numberOfCorrectQuestions,
      message,
      passed,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const getCompletedTopicsForCourse = async (req, res) => {
  try {
    const userID = req.user.id;
    const { courseID } = req.params;
    const completedTopicsForCourse = await UserTopic.find({
      courseID,
      userID,
      enabled: true,
    }).lean();

    for (let i = 0; i < completedTopicsForCourse.length; i++) {
      const currentTopicUser = completedTopicsForCourse[i];
      const topic = await Topic.findOne({
        _id: currentTopicUser.topicID,
        enabled: true,
      });
      currentTopicUser.name = topic.name;
      currentTopicUser.description = topic.description;
    }
    res.status(200).send(completedTopicsForCourse);
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};
