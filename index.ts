import cors from 'cors';
import express from 'express';
import connectDB from './db/db';

const port = process.env.PORT || 5000;

const app = express();
app.use(cors());

// for image uploading in admin page
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/user', require('./routes/user'));
// app.use('/auth', require('./routes/auth'));
// app.use('/course', require('./routes/course'));
// app.use('/topic', require('./routes/topic'));
// app.use('/payment', require('./routes/payment'));
// app.use('/stats', require('./routes/stats'));

connectDB();
app.listen(port, () => console.log('Server running!'));
