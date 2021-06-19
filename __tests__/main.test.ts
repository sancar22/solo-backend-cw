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

describe('POST /auth/register', () => {
  let endpoint: Test;
  beforeEach(() => {
    endpoint = request(server).post('/auth/register');
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

  // test('returns 409 if user exists', async () => {
  //   const response = await endpoint.send(mockUsers[random(mockUsers.length)]);
  //   expect(response.status).toBe(409);
  //   expect(response.body).toHaveProperty('error');
  // });
})

afterAll(async () => {
  await db?.connection.close();
  await server.close();
});