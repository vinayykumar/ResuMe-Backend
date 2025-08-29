const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectMongoDB = async () => {
    mongoose.connect(process.env.DB_URL)
    .then(() => console.log("Database Connected ;)"))
    .catch((err) => console.log("Database Connection Error",err));
};

module.exports = connectMongoDB;
