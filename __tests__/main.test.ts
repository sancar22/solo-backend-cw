import { Mongoose } from 'mongoose';
import request, { Test } from 'supertest';
import { Server } from 'http';
import bootServer from '../server';
import bootDB from '../db/db';
import { seedDb } from '../__seed__/index';

const port = Number(process.env.TEST_PORT);
const connectionString = String(process.env.CHARLEY_TEST_DB_CONN);

let server: Server;
let db: Mongoose | undefined;

beforeAll(async () => {
  db = await bootDB(connectionString);
  if (db) {
    await db?.connection.db.dropDatabase();
    const seedData = await seedDb(db);
    // mockUsers = seedData.users;
    // mockProducts = seedData.products;
  }
  server = bootServer(port);
});

describe('POST /auth/login', () => {
  let endpoint: Test;

  beforeEach(() => {
    endpoint = request(server).post('/auth/login');
  });

  // TODO
  // if user not in mocks, return 401
  // if invalid username, return 401
  // if invalid password, return 401
  // if user account not verified, return 401
  // if successful, return 200

  test('rejects if user not in mocks', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      admin: false,
    });
    expect(response.status).toBe(401);
  });

  test('rejects if username not valid', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      admin: false,
    });
    expect(response.status).toBe(401);
  });

  test('rejects if password not valid', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      admin: false,
    });
    expect(response.status).toBe(401);
  });

  test('rejects if user account not verified', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      admin: false,
    });
    expect(response.status).toBe(401);
  });

  test('200 if successful', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      admin: false,
    });
    expect(response.status).toBe(200);
  });

})

describe('POST /auth/register', () => {
  let endpoint: Test;
  beforeEach(() => {
    endpoint = request(server).post('/auth/register');
  });

  // TODO
  // rejects if no name provided
  // rejects if email not valid
  // rejects if user already exists
  // rejects if password not long enough
  // rejects if password is incorrect
  // if successul, return 201

  test('creates user', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      passwordRepeat: 'password123',
    });
    expect(response.status).toBe(201);
  });

  // test('returns 409 if user exists', async () => {
  //   const response = await endpoint.send(mockUsers[random(mockUsers.length)]);
  //   expect(response.status).toBe(409);
  //   expect(response.body).toHaveProperty('error');
  // });
})

describe('POST /auth/forgotPW', () => {
  let endpoint: Test;
  beforeEach(() => {
    endpoint = request(server).post('/auth/forgotPW');
  });

  // TODO
  // if user doesn't exist, send 200
  // if user exists, send 200

  test('sends 200 if user not in db', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password123',
      passwordRepeat: 'password123',
    });
    expect(response.status).toBe(201);
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
  // if user doesn't exist, send 401
  // if user exists but code is incorrect, send 401
  // if password updated successfully, send 200
  // if token expires before reset, send 401

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

describe('POST /auth/changePW', () => {
  let endpoint: Test;
  beforeEach(() => {
    endpoint = request(server).post('/auth/changePW');
  });

  // TODO
  // if password isn't long enough, send 400
  // if passwords don't match, send 401
  // if successful, send 200

  test('rejects if password not long enough', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'passw',
      passwordRepeat: 'password123',
    });
    expect(response.status).toBe(400);
  });
})

describe('POST /auth/changePWInApp', () => {
  let endpoint: Test;
  beforeEach(() => {
    endpoint = request(server).post('/auth/changePWInApp');
  });

  // TODO
  // if passwords is not correct, send 401
  // if password isn't long enough, send 400
  // if passwords don't match, send 401
  // if password has already been used, send 401
  // if successful, send 204

  test('rejects if password not long enough', async () => {
    const response = await endpoint.send({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'passw',
      passwordRepeat: 'password123',
    });
    expect(response.status).toBe(201);
  });
})


afterAll(async () => {
  await db?.connection.close();
  await server.close();
});