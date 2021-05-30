const cors = require('cors')
const express = require('express')
const connectDB = require('./db/db');
const PORT = process.env.PORT || 5000

const app = express()

app.use(cors());
app.use(express.json());


app.use('/user', require('./routes/user'))
app.use('/auth', require('./routes/auth'))

connectDB();
app.listen(PORT, () => console.log('Server running!'));

