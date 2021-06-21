import http from 'http';
import cors from 'cors';
import express from 'express';
import userRouter from './routes/user';
import authRouter from './routes/auth';
import courseRouter from './routes/course';
import topicRouter from './routes/topic';
import paymentRouter from './routes/payment';
import statsRouter from './routes/stats';

const port = process.env.PORT || 5000;

const bootServer = (port: number): http.Server => {
  const app = express();
  app.use(cors());

  // for image uploading in admin page
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.use('/auth', authRouter);
  app.use('/user', userRouter);
  app.use('/payment', paymentRouter);
  app.use('/topic', topicRouter);
  app.use('/course', courseRouter);
  app.use('/stats', statsRouter);

  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`Server is running on port:${port}`);
  });

  return server;
}

export default bootServer;
