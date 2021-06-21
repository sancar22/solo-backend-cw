import { Mongoose } from 'mongoose';

import { Admin } from '../models/admin';
import { Course } from '../models/course';
import { Topic } from '../models/topic';
import { Transaction } from '../models/transaction';
import { User } from '../models/user';
import { UserCourse } from '../models/userCourse';
import { UserTopic } from '../models/userTopic';

import admins from './mockData/admins.json';
import users from './mockData/users.json';
import courses from './mockData/courses.json';
import topics from './mockData/topics.json';
import transactions from './mockData/transactions.json';
import userCourses from './mockData/usercourses.json';
import userTopics from './mockData/usertopics.json';

export interface DbSeedData {
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
  {import: users, modelName: 'User'},
  {import: courses, modelName: 'Course'},
  {import: topics, modelName: 'Topic'},
  {import: transactions, modelName: 'Transaction'},
  {import: userCourses, modelName: 'UserCourse'},
  {import: userTopics, modelName: 'UserTopic'}
]

let untypedSeed: any = {};


export const seedDb = async (db: Mongoose): Promise<DbSeedData> => {

  const formatMocks = (input: any[], modelName: string) => {
    const  mockArray: any[] = [];
    input.forEach(data => {
      const mock = {...data,
        _id: data._id['$oid'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      if (HAS_USER_ID.includes(modelName)) {
        mock.userID = data.userID['$oid'];
      }
      if (HAS_COURSE_ID.includes(modelName)) {
        mock.courseID = data.courseID['$oid'];
      }
      if (HAS_TOPIC_ID.includes(modelName)) {
        mock.topicID = data.topicID['$oid'];
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
  const seed: DbSeedData = {...untypedSeed};

  await db.connection.models.Admin.insertMany(seed['Admin']);
  await db.connection.models.Topic.insertMany(seed['Topic']);
  await db.connection.models.Course.insertMany(seed['Course']);
  await db.connection.models.Transaction.insertMany(seed['Transaction']);
  await db.connection.models.UserCourse.insertMany(seed['UserCourse']);
  await db.connection.models.UserTopic.insertMany(seed['UserTopic']);

  return (seed);
}