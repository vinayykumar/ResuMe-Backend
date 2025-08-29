const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userId : { type: String, required: true, unique: true},

    username : { type: String, required: true, trim: true},
    email : {type: String, required: true, unique: true, lowercase: true, index: true},
    password: { type: String, required: true },

    otp: { type: String },
    otpExpiry: { type: Date },

    refreshTokens : [String],

    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
    
    lastLogin: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User',userSchema);