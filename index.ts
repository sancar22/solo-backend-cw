import bootDB from './db/db';
import bootServer from './server';

const PORT = Number(process.env.PORT) || 3001;
const connectionString = String(process.env.mongoURI);

bootDB(connectionString);
bootServer(PORT);
