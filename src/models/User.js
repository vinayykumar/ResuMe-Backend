const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name : { type : String},
    email : { type : String, required : true, unique : true, lowercase : true, trim : true},
    password : { type : String, require : true},
    createdAt : { type : Date, default : Date.now }
});