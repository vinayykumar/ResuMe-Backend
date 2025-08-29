const bcrypt = require('bcrypt')
const crypto = require('crypto')
const User = require('../models/User')
const {sendEmail} = require('../utils/sendEmail')


const generateOTP = () => {
    return Math.floor(100000 + Math.random()*900000).toString();
}

async function handleSignupUser(req,res) {
    try{
        const {username, email, password} = req.body;

        //Validation
        if(!username || !email || !password) return res.status(400).json({msg:"All fields are required"});
        
        //Checking if user exists
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({msg:"User already registered"});

        //Hashing password
        const hashPassword = await bcrypt.hash(password,10);

        //Generate OTP
        const otp = generateOTP();
        const otpExpiry = Date.now() + 10*60*1000;

        //Create User in DB
        const newUser = new User({
            username,
            email,
            password : hashPassword,
            isVerified : false,
            otp,
            otpExpiry,
        });

        await newUser.save();

        await sendEmail(email,`Verify your account, your OTP is ${otp}`);

        res.json({msg:"Signup successful. Please verify your email with OTP."});
    }
    catch(err){

    }
}