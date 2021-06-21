import {Request, Response} from 'express';
import Course from '../models/course';
import {Topic} from '../models/topic';
import TopicModel from '../models/topic';
import UserTopicModel from '../models/userTopic';
import {UserTopic} from '../models/userTopic';


interface ClientTopic extends Topic {
  courseName: string;
}

interface TopicStatus extends Topic {
  completed: boolean;
}

interface ClientUserTopic extends UserTopic {
  name: string;
  description: string;
}

// This will give information in a way that can be read by the tables in the admin page
export const getAllTopics = async (req: Request, res: Response) => {
  try {
    const topics = await TopicModel.aggregate([
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

export const getTopicsById = async (req: Request, res: Response) => {
  try {
    const topic = await TopicModel.findOne({
      _id: req.params.id,
      enabled: true,
    }).lean();


    if (topic) {
      const course = await Course.findById(topic.courseID);
      if (course) {
        const clientTopic: ClientTopic = {...topic, courseName: course.name};

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
          allInfo: clientTopic,
          tableOptions,
          entityName,
          categoryName,
        });
      } else res.status(404).send('course not found');
    } else res.status(404).send('topic not found');

  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const addTopic = async (req: Request, res: Response) => {
  try {
    await TopicModel.create(req.body);
    res.status(201).send('Topic added succesfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const editTopic = async (req: Request, res: Response) => {
  try {
    const { questions, videoURL, name, description } = req.body;
    await TopicModel.updateOne(
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
export const deleteTopic = async (req: Request, res: Response) => {
  const topicID = req.params.id;
  try {
    await TopicModel.updateOne(
      { _id: topicID },
      {
        $set: {
          enabled: false,
        },
      }
    );
    await UserTopicModel.updateMany({ topicID }, { enabled: false });
    res.status(200).send('Topic deleted succesfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const getTopicsClientSide = async (req: Request, res: Response) => {
  try {
    const userID = res.locals.user.id;
    const { courseID } = req.params;
    const allTopics = await TopicModel.find({ courseID, enabled: true }).lean();

    for (let i = 0; i < allTopics.length; i++) {
      const currentTopic: TopicStatus = {...allTopics[i],
        completed: false
      };
      const userTopic = await UserTopicModel.findOne({
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

export const getTopicById = async (req: Request, res: Response) => {
  try {
    const { topicID } = req.params;
    const topic = await TopicModel.findOne({ _id: topicID, enabled: true }).lean();

    if (topic) {
      //TODO
      // any[], make an interface for questions
      for (let i = 0; i < topic.questions.length; i++) {
        topic.questions[i].userAnswer = 0;
        topic.questions[i].userRespondedCorrectly = false;
        if (topic.questions[i].choices[0].correct) {
          topic.questions[i].userRespondedCorrectly = true;
        }
      }
      res.status(200).send(topic);
    } else {
      res.status(404).send('topic not found');
    }
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

export const submitTest = async (req: Request, res: Response) => {
  try {
    const userID = res.locals.user.id;
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
    await UserTopicModel.create({
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

export const getCompletedTopicsForCourse = async (req: Request, res: Response) => {
  try {
    const userID = res.locals.user.id;
    const { courseID } = req.params;
    const completedTopicsForCourse = await UserTopicModel.find({
      courseID,
      userID,
      enabled: true,
    }).lean();

    const clientTopicsForCourse: ClientUserTopic[] = [];
    for (let i = 0; i < completedTopicsForCourse.length; i++) {
      let currentUserTopic = completedTopicsForCourse[i];
      const topic = await TopicModel.findOne({
        _id: currentUserTopic.topicID,
        enabled: true,
      });

      if (topic) {
        const clientUserTopic: ClientUserTopic = {...currentUserTopic,
          name: topic.name,
          description: topic.description
        }
        clientTopicsForCourse.push(clientUserTopic);
      }
    }
    res.status(200).send(clientTopicsForCourse);
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};
