import { Mongoose } from 'mongoose';
import request, { Test } from 'supertest';
import { Server } from 'http';

import bootServer from '../server';
import bootDB from '../db/db';
import { seedDb } from '../__seed__/index';

import { User } from '../models/user';

const port = Number(process.env.TEST_PORT);
const connectionString = String(process.env.TEST_DB_CONN);

let server: Server;
let db: Mongoose | undefined;
let seedUsers: User[];

export const random = (max: number): number => Math.floor(Math.random() * max);

beforeAll(async () => {
  db = await bootDB(connectionString);
  if (db) {
    const seedData = await seedDb(db);
    seedUsers = seedData.User;
  }
  server = bootServer(port);
});

test('Mock users and mock products must be present', () => {
  expect(seedUsers).toHaveLength(4);
});

describe('POST /auth/login', () => {
  let endpoint: Test;

  beforeEach(() => {
    endpoint = request(server).post('/auth/login');
  });

  test('rejects if user not in mocks', async () => {
    const response = await endpoint.send({
      email: 'bob@example.com',
      password: 'password123',
    });
    expect(response.status).toBe(401);
  });

  test('rejects if username not valid', async () => {
    const response = await endpoint.send({
      email: 'bob@example.com',
      password: 'password123',
    });
    expect(response.status).toBe(401);
  });

  test('rejects if password not valid', async () => {
    const response = await endpoint.send({
      email: 'bob@example.com',
      password: 'password123',
    });
    expect(response.status).toBe(401);
  });

  test('rejects if user account not verified', async () => {
    const response = await endpoint.send({
      email: 'bob@example.com',
      password: 'password123',
    });
    expect(response.status).toBe(401);
  });

  test('200 if successful', async () => {
    const response = await endpoint.send({
      email: 'kip@test.com',
      password: 'password',
    });
    expect(response.status).toBe(200);
  });
});

describe('POST /auth/register', () => {
  let endpoint: Test;
  beforeEach(() => {
    endpoint = request(server).post('/auth/register');
  });

  test('rejects if no name provided', async () => {
    const response = await endpoint.send({
      name: '',
      email: 'bob@example.com',
      password: 'password123',
      passwordRepeat: 'password123',
    });
    expect(response.status).toBe(401);
  });

  test('rejects if email is not valid', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@ec',
      password: 'password123',
      passwordRepeat: 'password123',
    });
    expect(response.status).toBe(401);
  });

  test('rejects if user already exists', async () => {
    const response = await endpoint.send(
      seedUsers[0],
    );
    expect(response.status).toBe(409);
  });

  test('rejects if password not long enough', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'passw',
      passwordRepeat: 'passw',
    });
    expect(response.status).toBe(400);
  });

  test('rejects if passwordRepeat does not match', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      passwordRepeat: 'password',
    });
    expect(response.status).toBe(401);
  });

  test('creates user', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      passwordRepeat: 'password123',
    });
    expect(response.status).toBe(201);
  });
});

describe('POST /auth/forgotPW', () => {
  let endpoint: Test;
  beforeEach(() => {
    endpoint = request(server).post('/auth/forgotPW');
  });

  test('sends 200 if user not in db', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      passwordRepeat: 'password123',
    });
    expect(response.status).toBe(200);
  });

  test('sends 200 if user in db', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      passwordRepeat: 'password123',
    });
    expect(response.status).toBe(200);
  });
});

describe('POST /auth/verifyEmailCode', () => {
  let endpoint: Test;
  beforeEach(() => {
    endpoint = request(server).post('/auth/verifyEmailCode');
  });

  test('rejects if user does not exist', async () => {
    const response = await endpoint.send({
      email: seedUsers[random(seedUsers.length)].email,
      code: Math.random() * 10000,
    });
    expect(response.status).toBe(401);
  });
});

describe('POST /auth/changePW', () => {
  let endpoint: Test;
  let token: string;

  beforeEach(() => {
    endpoint = request(server).post('/auth/changePW');
  });

  test('pre-test login', async () => {
    const response = await request(server).post('/auth/login').send({
      email: 'kip@test.com',
      password: 'password',
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    token = response.body.token;
  });

  test('rejects if password not long enough', async () => {
    const response = await endpoint.send({
      password: 'passw',
      passwordRepeat: 'passw',
    });
    expect(response.status).toBe(401);
  });

  test('rejects if passwordRepeat does not match password', async () => {
    const response = await endpoint.send({
      password: 'password1234',
      passwordRepeat: 'password',
    });
    expect(response.status).toBe(401);
  });

  test('successful if password changed', async () => {
    const response = await endpoint.set('Authorization', `bearer ${token}`).send({
      password: 'password1234',
      passwordRepeat: 'password1234',
    });
    expect(response.status).toBe(200);
  });
});

describe('POST /auth/changePWInApp', () => {
  let endpoint: Test;
  beforeEach(() => {
    endpoint = request(server).post('/auth/changePWInApp');
  });

  test.skip('pre-test login', async () => {
    const response = await request(server).post('/auth/login').send({
      email: 'kip@test.com',
      password: 'password',
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    const { token } = response.body;
    console.log(token);
  });

  // TODO
  // if successful, send 204

  test('rejects if password is not correct', async () => {
    const response = await endpoint.send({
      oldPassword: 'password',
      password: 'newpassword',
      passwordRepeat: 'newpassword',
    });
    expect(response.status).toBe(401);
  });

  test('rejects if password not long enough', async () => {
    const response = await endpoint.send({
      oldPassword: 'password',
      password: 'newpassword',
      passwordRepeat: 'newpassword',
    });
    expect(response.status).toBe(401);
  });

  test('rejects if passwordRepeat does not match password', async () => {
    const response = await endpoint.send({
      oldPassword: 'password',
      password: 'newpassword',
      passwordRepeat: 'newpassword',
    });
    expect(response.status).toBe(401);
  });

  test('rejects if password same as current one', async () => {
    const response = await endpoint.send({
      oldPassword: 'password',
      password: 'newpassword',
      passwordRepeat: 'newpassword',
    });
    expect(response.status).toBe(401);
  });

  test('successful if password changed', async () => {
    const loginResponse = await request(server).post('/auth/login').send({
      email: 'kip@test.com',
      password: 'password',
    });
    const { token } = loginResponse.body;
    console.log('changePWInApp token ', token);
    const response = await endpoint.set('Authorization', `bearer ${token}`).send({
      oldPassword: 'password',
      password: 'newpassword',
      passwordRepeat: 'newpassword',
    });
    expect(response.status).toBe(204);
  });
});

afterAll(async () => {
  await db?.connection.db.dropDatabase();
  await db?.connection.close();
  await server.close();
});
