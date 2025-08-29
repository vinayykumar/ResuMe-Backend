require('dotenv').config();
const express = require('express')
const cookieParser = require('cookie-parser');
const cors = require('cors')
const helmet = require("helmet");
const morgan = require("morgan");
const {connectMongoDB} = require('./config/db')
const authRoutes = require('./routes/auth')

//DB
const app = express();
connectMongoDB();


//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:3000',
  origin: "*",
  credentials: true,
}));
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); 
app.use(morgan("dev"));


//Routes
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));