// import mongoose from "mongoose";

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log(`Mongodb Connected ${mongoose.connection.host}`);
//   } catch (error) {
//     console.log(`Mongodb Error ${error}`);
//   }
// };

// export default connectDB;



const mongoose = require("mongoose");

require("dotenv").config();

const mongoURI = process.env.mongoURI;

const connection = mongoose.connect(mongoURI);

// const connection = mongoose.createConnection(mongoURI)

module.exports = {
  connection,
};
