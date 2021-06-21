import { Mongoose } from 'mongoose';
import request, { Test } from 'supertest';
import { Server } from 'http';
import bootServer from '../server';
import bootDB from '../db/db';
import { seedDb } from '../__seed__/index';
import {User} from '../models/user';

const port = Number(process.env.COURSE_PORT);
const connectionString = String(process.env.COURSE_TEST_DB_CONN);

let server: Server;
let db: Mongoose | undefined;
let mockUsers: User[];

beforeAll(async () => {
  db = await bootDB(connectionString);
  if (db) {
    await db?.connection.db.dropDatabase();
    const seedData = await seedDb(db);
    mockUsers = seedData.User;
  }
  server = bootServer(port);
});

describe('POST /enroll/free', () => {
  let endpoint: Test;
  let token: string;

  beforeEach( async () => {
    endpoint = request(server).post('/course/enroll/free');
  });

  test('a test', async () => {
    const response = await request(server).post('/auth/login').send({
      email: "charley@test.com",
      password: "password"
    })
    expect(response).toHaveProperty('token');
    token = response.token;
  })


})





afterAll(async () => {
  await db?.connection.close();
  await server.close();
});