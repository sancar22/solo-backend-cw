import { Mongoose, ObjectId, Types } from 'mongoose';
import { Topic } from '../models/topic';
import topics from './topics.json';

interface DbSeedData {
  topics: Topic[]
}

export const seedDb = async (db: Mongoose): Promise<DbSeedData> => {

  const mockTopics: Topic[] = [];
  topics.forEach(topic => {
    const mockTopic = {...topic,
      _id: new Types.ObjectId() as unknown as string,
      courseID: new Types.ObjectId() as unknown as string,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    mockTopics.push(mockTopic);
  })

  await db.connection.models.Topic.insertMany(mockTopics);
  return { topics: mockTopics };
}