import cors from 'cors';
import express from 'express';
import userRouter from './routes/user';
import authRouter from './routes/auth';
import courseRouter from './routes/course';
import topicRouter from './routes/topic';
import paymentRouter from './routes/payment';
import statsRouter from './routes/stats';

const port = process.env.PORT || 5000;

const app = express();
app.use(cors());

// for image uploading in admin page
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/course', courseRouter);
app.use('/topic', topicRouter);
app.use('/payment', paymentRouter);
app.use('/stats', statsRouter);

app.listen(port, () => console.log('Server running!'));
