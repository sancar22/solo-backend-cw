import bootDB from './db/db';
import bootServer from './server';

const PORT = Number(process.env.PORT) || 3001;
const connectionString = String(process.env.TEST_DB_CONN);

bootDB(connectionString);
bootServer(PORT);
