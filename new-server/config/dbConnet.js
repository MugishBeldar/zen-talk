const mongoose = require('mongoose');

// Function to connect
const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('DB connected successfully!');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

dbConnect();