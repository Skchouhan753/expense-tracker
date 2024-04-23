require("dotenv").config()
const express = require("express");
const cors = require("cors");




const { connection } = require("./config/db");
const { userRuter } = require("./routes/userRoutes");



const app = express();



app.use(express.json());
app.use(cors());



app.use("/user", userRuter);

app.get("/", (req, res) => {
  return res.status(200).send("<h1>Welcome To Node server</h1>");
});

//port
const PORT = process.env.PORT || 8080;

app.listen(PORT, async () => {
  try {
    await connection;
    console.log(`server is running at port ${PORT}`);
    console.log(`connected to mongoDB`);
  } catch (err) {
    console.log(err);
  }
});