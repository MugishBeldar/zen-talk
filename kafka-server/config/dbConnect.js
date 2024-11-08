const mongoose = require("mongoose");

// Function to connect
const dbConnect = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGODB_URL);
    console.log("DB connected successfully!");
    global.dbConnection = db.connection;
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
dbConnect();
