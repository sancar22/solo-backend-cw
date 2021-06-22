import { Request, Response } from 'express';
import TopicModel from '../../models/topic';
import { Topic } from '../../models/topic';
import UserTopicModel from '../../models/userTopic';
import { UserTopic } from '../../models/userTopic';


interface TopicStatus extends Topic {
  completed: boolean;
}

interface ClientUserTopic extends UserTopic {
  name: string;
  description: string;
}


const getTopicsClientSide = async (req: Request, res: Response) => {
  try {
    const userID = res.locals.user.id;
    const { courseID } = req.params;
    const allTopics = await TopicModel.find({ courseID, enabled: true }).lean();

    const topicsWithStatus: TopicStatus[] = [];
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
      topicsWithStatus.push(currentTopic);
    }
    res.status(200).send(topicsWithStatus);
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

const getTopicById = async (req: Request, res: Response) => {
  try {
    const { topicID } = req.params;
    const topic = await TopicModel.findOne({ _id: topicID, enabled: true }).lean();

    if (topic) {
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

const getCompletedTopicsForCourse = async (req: Request, res: Response) => {
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

const submitTest = async (req: Request, res: Response) => {
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


export default {
  getTopicsClientSide, getTopicById, getCompletedTopicsForCourse, submitTest
}
