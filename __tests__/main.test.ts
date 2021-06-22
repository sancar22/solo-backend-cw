import { Mongoose } from 'mongoose';
import request, { Test } from 'supertest';
import { Server } from 'http';
import bootServer from '../server';
import bootDB from '../db/db';
import { seedDb } from '../__seed__/index';
import { User } from '../models/user';
import { UserCourse } from '../models/userCourse';

const port = Number(process.env.TEST_PORT);
const connectionString = String(process.env.TEST_DB_CONN);

let server: Server;
let db: Mongoose | undefined;

let seedUsers: User[];
let seedUserCourses: UserCourse[];

export const random = (max: number): number => Math.floor(Math.random() * max);

beforeAll(async () => {
  db = await bootDB(connectionString);
  if (db) {
    const seedData = await seedDb(db);
    seedUsers = seedData.User;
    seedUserCourses = seedData.UserCourse;
  }
  server = bootServer(port);
});

test('Mock users and mock products must be present', () => {
  expect(seedUsers).toHaveLength(2);
});

describe('POST /auth/login', () => {
  let endpoint: Test;

  beforeEach(() => {
    endpoint = request(server).post('/auth/login');
  });

  // TODO
  // if successful, return 200

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
      password: 'password'
    }
    );
    expect(response.status).toBe(200);
  });

})

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
      seedUsers[0]
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

})

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
})

describe('POST /auth/verifyEmailCode', () => {
  let endpoint: Test;
  beforeEach(() => {
    endpoint = request(server).post('/auth/verifyEmailCode');
  });

  // TODO
  // (Uses verifyPWCodeChange)
  // if email verified successfully, send 200 - How?
  // if token expires before reset, send 401 - How?

  test('rejects if user does not exist', async () => {
    const response = await endpoint.send({
      email: seedUsers[random(seedUsers.length)].email,
      code: Math.random() * 10000
    });
    expect(response.status).toBe(401);
  });
  
})

describe('POST /auth/changePW', () => {
  let endpoint: Test;
  beforeEach(() => {
    endpoint = request(server).post('/auth/changePW');
  });

  // TODO
  // if successful, send 200

  test('rejects if password not long enough', async () => {
    const response = await endpoint.send({
      password: 'passw',
      passwordRepeat: 'passw',
    });
    expect(response.status).toBe(401);
  });

  test('rejects if passwordRepeat does not match password', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      passwordRepeat: 'password',
    });
    expect(response.status).toBe(401);
  });

  test('successful if password changed', async () => {
    const response = await endpoint.send({
      password: 'password1234',
      passwordRepeat: 'password1234',
    });
    expect(response.status).toBe(200);
  });
})

describe('POST /auth/changePWInApp', () => {
  let endpoint: Test;
  beforeEach(() => {
    endpoint = request(server).post('/auth/changePWInApp');
  });

  // TODO
  // if password is not correct, send 401
  // if password isn't long enough, send 400
  // if passwordRepeat doesn't match password, send 401
  // if password is same as current one, send 401 - NEED PW
  // if successful, send 204



  test('rejects if password is not correct', async () => {
    const response = await endpoint.send({
      oldPassword: 'password',
      password: 'newpassword',
      passwordRepeat: 'newpassword'
    });
    expect(response.status).toBe(401);
  });

  test('rejects if password not long enough', async () => {
    const response = await endpoint.send({
      oldPassword: 'password',
      password: 'newpassword',
      passwordRepeat: 'newpassword'
    });
    expect(response.status).toBe(401);
  });

  test('rejects if passwordRepeat does not match password', async () => {
    const response = await endpoint.send({
      oldPassword: 'password',
      password: 'newpassword',
      passwordRepeat: 'newpassword'
    });
    expect(response.status).toBe(401);
  });

  test('rejects if password same as current one', async () => {
    const response = await endpoint.send({
      oldPassword: 'password',
      password: 'newpassword',
      passwordRepeat: 'newpassword'
    });
    expect(response.status).toBe(401);
  });

  test('successful if password changed', async () => {
    const response = await endpoint.send({
      oldPassword: 'password',
      password: 'newpassword',
      passwordRepeat: 'newpassword'
    });
    expect(response.status).toBe(401);
  });
})


afterAll(async () => {
  await db?.connection.db.dropDatabase();
  await db?.connection.close();
  await server.close();
});