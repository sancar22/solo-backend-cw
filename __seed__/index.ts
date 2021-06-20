import { Mongoose, Types } from 'mongoose';

import { Admin } from '../models/admin';
import { Course } from '../models/course';
import { Topic } from '../models/topic';
import { Transaction } from '../models/transaction';
import { User } from '../models/user';
import { UserCourse } from '../models/userCourse';
import { UserTopic } from '../models/userTopic';

import admins from './mockData/admins.json';
import courses from './mockData/courses.json';
import topics from './mockData/topics.json';
import transactions from './mockData/transactions.json';
import userCourses from './mockData/usercourses.json';
import userTopics from './mockData/usertopics.json';

interface DbSeedData {
  Admin: Admin[],
  Course: Course[],
  Topic: Topic[],
  Transaction: Transaction[],
  User: User[],
  UserCourse: UserCourse[],
  UserTopic: UserTopic[]
}

const HAS_USER_ID = ['Transaction', 'UserCourse', 'UserTopic'];
const HAS_COURSE_ID = ['Topic', 'Transaction', 'UserCourse', 'UserTopic'];
const HAS_TOPIC_ID = ['UserTopic']

const dataImports = [
  {import: admins, modelName: 'Admin'},
  {import: courses, modelName: 'Course'},
  {import: topics, modelName: 'Topic'},
  {import: transactions, modelName: 'Transaction'},
  {import: userCourses, modelName: 'UserCourse'},
  {import: userTopics, modelName: 'UserTopic'}
]

let untypedSeed: any = {};


export const seedDb = async (db: Mongoose): Promise<DbSeedData> => {

  const formatMocks = (data: any[], modelName: string) => {

    const  mockArray: any[] = [];
    data.forEach(data => {
      const mock = {...data,
        _id: new Types.ObjectId() as unknown as string,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      if (HAS_USER_ID.includes(modelName)) {
        mock.userID = new Types.ObjectId() as unknown as string
      }
      if (HAS_COURSE_ID.includes(modelName)) {
        mock.courseID = new Types.ObjectId() as unknown as string
      }
      if (HAS_TOPIC_ID.includes(modelName)) {
        mock.topicID = new Types.ObjectId() as unknown as string
      }
      mockArray.push(mock);
    })
    untypedSeed[modelName] = mockArray;
  }

  // populate untypedSeed
  dataImports.forEach((data) => {
    formatMocks(data.import, data.modelName);
  })
  // type check
  const seed: DbSeedData = untypedSeed;

  await db.connection.models.Admin.insertMany(seed['Admin']);
  await db.connection.models.Admin.insertMany(seed['Admin']);
  await db.connection.models.Topic.insertMany(seed['Topic']);
  await db.connection.models.Course.insertMany(seed['Course']);
  await db.connection.models.Transaction.insertMany(seed['Transaction']);
  await db.connection.models.UserCourse.insertMany(seed['UserCourse']);
  await db.connection.models.UserTopic.insertMany(seed['UserTopic']);

  return (seed);
}