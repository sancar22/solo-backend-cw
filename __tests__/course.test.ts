import { Mongoose } from 'mongoose';
import request, { Test } from 'supertest';
import { Server } from 'http';

import bootServer from '../server';
import bootDB from '../db/db';
import { seedDb } from '../__seed__/index';

import { User } from '../models/user';
import CourseModel, { Course } from '../models/course';
import UserCourseModel from '../models/userCourse';

const port = Number(process.env.COURSE_PORT);
const connectionString = String(process.env.COURSE_TEST_DB_CONN);

let server: Server;
let db: Mongoose | undefined;
let mockUsers: User[];
let mockCourses: Course[];

beforeAll(async () => {
  db = await bootDB(connectionString);
  if (db) {
    await db?.connection.db.dropDatabase();
    const seedData = await seedDb(db);
    mockUsers = seedData.User;
    mockCourses = seedData.Course;
  }
  server = bootServer(port);
});

describe('POST /enroll/free', () => {
  let endpoint: Test;
  let token: string;
  beforeEach(async () => {
    endpoint = request(server).post('/course/enroll/free');
  });

  test('pre-test login', async () => {
    const response = await request(server).post('/auth/login').send({
      email: 'charley@test.com',
      password: 'password',
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    token = response.body.token;
  });

  test('should require authentication', async () => {
    const response = await endpoint.send({
      course: {
        _id: mockCourses[1]._id,
      },
    });
    expect(response.status).toBe(401);
  });

  test('should check if tokens are valid', async () => {
    const courseID = mockCourses[1]._id;
    const response = await endpoint
      .send({ course: { _id: courseID } })
      .set('Authorization', "bearer i'mnotatoken");
    expect(response.status).toBe(401);
  });

  test('should enroll in free course if authenticated', async () => {
    const userID = mockUsers[3]._id;
    const courseID = mockCourses[1]._id;
    const response = await endpoint
      .send({ course: { _id: courseID } })
      .set('Authorization', `bearer ${token}`);

    expect(response.status).toBe(200);
    const registered = await UserCourseModel.find({ userID, courseID });
    expect(registered).toBeTruthy();
  });
});

describe('GET /myCourses', () => {
  let endpoint: Test;
  let token: string;

  beforeEach(async () => {
    endpoint = request(server).get('/course/client-side/myCourses');
  });

  test('pre-test login', async () => {
    const response = await request(server).post('/auth/login').send({
      email: 'charley@test.com',
      password: 'password',
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    token = response.body.token;
  });

  test('should require authentication', async () => {
    const response = await endpoint.send();
    expect(response.status).toBe(401);
  });

  test('should return an array of the users courses', async () => {
    const userID = mockUsers[3]._id;
    const response = await endpoint
      .send()
      .set('Authorization', `bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    const userCourses = await UserCourseModel.find({ userID });
    expect(userCourses).toHaveLength(response.body.length);
    expect(userCourses).toHaveLength(1);
  });
});

describe('GET /allCourses', () => {
  let endpoint: Test;
  let token: string;

  beforeEach(async () => {
    endpoint = request(server).get('/course/client-side/allCourses');
  });

  test('pre-test login', async () => {
    const response = await request(server).post('/auth/login').send({
      email: 'charley@test.com',
      password: 'password',
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    token = response.body.token;
  });

  test('should require authentication', async () => {
    const response = await endpoint.send();
    expect(response.status).toBe(401);
  });

  test('should respond with a list of all courses', async () => {
    const response = await endpoint
      .send()
      .set('Authorization', `bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    const courses = await CourseModel.find();
    expect(courses).toHaveLength(response.body.length);
  });
});

afterAll(async () => {
  await db?.connection.close();
  await server.close();
});
