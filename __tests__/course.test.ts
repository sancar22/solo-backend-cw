import { Mongoose } from 'mongoose';
import request, { Test } from 'supertest';
import { Server } from 'http';
import bootServer from '../server';
import bootDB from '../db/db';
import { seedDb } from '../__seed__/index';
import {User} from '../models/user';
import {Course} from '../models/course';

const port = Number(process.env.COURSE_PORT);
const connectionString = String(process.env.COURSE_TEST_DB_CONN);

interface tokenResponse {
  token: string;
};


let server: Server;
let db: Mongoose | undefined;
let mockUsers: User[];
let mockCourses: Course[]

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
  //let header: authHeader;

  beforeEach(async () => {
    endpoint = request(server).post('/course/enroll/free');
  });


  test('pre-test login', async () => {
    const response = await request(server).post('/auth/login').send({
      email: "charley@test.com",
      password: "password"
    })
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    let resBody: tokenResponse = response.body;
    token = resBody.token;
  })

  test('should require authentication', async () => {
    const response = await endpoint.send({
      course: {
        _id: mockCourses[1]._id
      }
    })
    expect(response.status).toBe(401);
  })

  test('enrolls in free course if authenticated', async () => {
    const response = await endpoint
      .send({course: {_id: mockCourses[1]._id}})
      .set('Authorization', 'bearer ' + token);

    expect(response.status).toBe(200);
    
  })


})



afterAll(async () => {
  await db?.connection.close();
  await server.close();
});