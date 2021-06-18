import mongoose from 'mongoose';
const { mongoURI } = process.env;
const url = `${mongoURI}`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,}, () => {
    console.log('peanut');
  })

export default mongoose;
