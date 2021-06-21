import {Request, Response} from 'express';
import Course from '../../models/course';
import {Topic} from '../../models/topic';
import TopicModel from '../../models/topic';
import UserTopicModel from '../../models/userTopic';
import {UserTopic} from '../../models/userTopic';


interface ClientTopic extends Topic {
  courseName: string;
}


const getAllTopics = async (req: Request, res: Response) => {
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

const getTopicsById = async (req: Request, res: Response) => {
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

const addTopic = async (req: Request, res: Response) => {
  try {
    await TopicModel.create(req.body);
    res.status(201).send('Topic added succesfully!');
  } catch (e) {
    console.log(e);
    res.status(500).send('Internal Server Error!');
  }
};

const editTopic = async (req: Request, res: Response) => {
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

const deleteTopic = async (req: Request, res: Response) => {
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

export default {
  getAllTopics, getTopicsById, addTopic, editTopic, deleteTopic
}


