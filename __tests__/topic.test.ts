import { Mongoose } from 'mongoose';
import request, { Test } from 'supertest';
import { Server } from 'http';

import bootServer from '../server';
import bootDB from '../db/db';
import { seedDb } from '../__seed__/index';
import { User } from '../models/user';
import { Course } from '../models/course';
import TopicModel, { Topic } from '../models/topic';


const port = Number(process.env.TOPIC_PORT);
const connectionString = String(process.env.TOPIC_TEST_DB_CONN);

let server: Server;
let db: Mongoose | undefined;
let mockUsers: User[];
let mockCourses: Course[];
let mockTopics: Topic[];

const random = (max: number): number => Math.floor(Math.random() * max);

beforeAll(async () => {
  db = await bootDB(connectionString);
  if (db) {
    await db?.connection.db.dropDatabase();
    const seedData = await seedDb(db);
    mockUsers = seedData.User;
    mockCourses = seedData.Course;
    mockTopics = seedData.Topic;
  }
  server = bootServer(port);
});


describe('GET /allTopics', () => {
  let endpoint: Test;
  let token: string;
  let courseID: string;

  beforeEach(async () => {
    let courseCount = mockCourses.length-1;
    const i = random(courseCount);
    courseID = mockCourses[i]._id;
    endpoint = request(server).get(`/topic/client-side/allTopics/${courseID}`);
  });

  test('pre-test login', async () => {
    const response = await request(server).post('/auth/login').send({
      email: "charley@test.com",
      password: "password"
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    token = response.body.token;
  });

  test('should require authentication', async () => {
    const response = await endpoint.send();
    expect(response.status).toBe(401);
  });

  test('should respond with topic list for course', async () => {
    const response = await endpoint
      .send()
      .set('Authorization', 'bearer ' + token);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    const topics = await TopicModel.find({courseID});
    expect(response.body.length).toBe(topics.length);
  });

});

describe('GET /getTopicById', () => {
  let endpoint: Test;
  let token: string;
  let topicID: string;

  beforeEach(async () => {
    let topicCount = mockTopics.length-1;
    const j = random(topicCount);
    topicID = mockTopics[j]._id;
    endpoint = request(server).get(`/topic/client-side/getTopicById/${topicID}`);
  });

  test('pre-test login', async () => {
    const response = await request(server).post('/auth/login').send({
      email: "charley@test.com",
      password: "password"
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    token = response.body.token;
  });

  test('should require authentication', async () => {
    const response = await endpoint.send();
    expect(response.status).toBe(401);
  });

  test('should respond with a topic', async () => {
    const response = await endpoint
      .send()
      .set('Authorization', 'bearer ' + token);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('videoURL');
    expect(response.body).toHaveProperty('description');
    const randomTopic = await TopicModel.findById(topicID);
    expect(response.body.description).toBe(randomTopic?.description);
  });

});


describe('GET /completedTopics', () => {
  let endpoint: Test;
  let token: string;
  let courseID: string;

  beforeEach(async () => {
    let courseCount = mockCourses.length-1;
    const i = random(courseCount);
    courseID = mockCourses[i]._id;
    endpoint = request(server).get(`/topic/client-side/allTopics/${courseID}`);
  });

  test('pre-test login', async () => {
    const response = await request(server).post('/auth/login').send({
      email: "charley@test.com",
      password: "password"
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    token = response.body.token;
  });

  test('should require authentication', async () => {
    const response = await endpoint.send();
    expect(response.status).toBe(401);
  });

})


afterAll(async () => {
  await db?.connection.close();
  await server.close();
});