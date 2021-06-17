import mongoose from 'mongoose';
const { mongoURI } = process.env;
const url = `${mongoURI}`;


const connectDB = async () => {
  try {
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('MongoDB Connected!');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
