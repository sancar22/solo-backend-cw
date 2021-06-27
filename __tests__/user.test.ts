import { Mongoose } from 'mongoose';
import request, { Test } from 'supertest';
import { Server } from 'http';

import bootServer from '../server';
import bootDB from '../db/db';
import { seedDb } from '../__seed__/index';
import { User } from '../models/user';

const port = Number(process.env.USER_PORT);
const connectionString = String(process.env.USER_TEST_DB_CONN);

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

describe('GET /getInfo', () => {
  let endpoint: Test;
  let token: string;

  beforeEach(async () => {
    endpoint = request(server).get('/user/getInfo');
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

  test('should respond with user details', async () => {
    const response = await endpoint
      .send()
      .set('Authorization', `bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
    expect(response.body.name).toBe(mockUsers[3].name);
  });
});

afterAll(async () => {
  await db?.connection.close();
  await server.close();
});
