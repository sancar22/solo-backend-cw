import {connect, Mongoose} from 'mongoose';

const bootDB = async (url: string): Promise<Mongoose | undefined> => {
  try {
    const connection = await connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,})
    console.log('connected to db');
    return connection;
  } catch (error) {
    console.log('[Database connection error]:\n', error);
  }
}

export default bootDB;
