const mongoose = require('mongoose');

const connectMongoDB = async () => {
    mongoose.connect(process.env.DB_URL,{
        useNewUrlParser : true,
        useUnifiedTopology : true
    })
    .then(() => console.log("Database Connected ;)"))
    .catch((err) => console.log("Database Connection Error",err));
};

module.exports = connectMongoDB;
