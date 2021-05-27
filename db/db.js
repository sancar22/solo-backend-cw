const mongoose = require("mongoose");
const defaultConfig = require("./default.json");

const connectDB = async () => {
  try {
    await mongoose.connect(defaultConfig.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });
    console.log("MongoDB Connected!");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
