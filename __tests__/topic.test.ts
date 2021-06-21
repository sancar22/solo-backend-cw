import { Mongoose } from 'mongoose';
import request, { Test } from 'supertest';
import { Server } from 'http';
import bootServer from '../server';
import bootDB from '../db/db';
import { seedDb } from '../__seed__/index';
import {User} from '../models/user';

const port = Number(process.env.TEST_PORT);
const connectionString = String(process.env.TEST_mongoURI);

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















afterAll(async () => {
  await db?.connection.close();
  await server.close();
});