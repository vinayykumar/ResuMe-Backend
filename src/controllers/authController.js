const bcrypt = require('bcrypt')
const crypto = require('crypto')
const User = require('../models/User')
const sendEmail = require('../utils/sendEmail')
const {generateAccessToken, generateRefreshToken} = require('../utils/jwt')


// const { GoogleGenerativeAI } = require("@google/generative-ai");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });



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
        console.log(err);
        res.status(500).json({error : "SignUp Failed"});
    }
}

async function handleVerifyOTP(req,res) {
    try{
        const {email, otp} = req.body;
        if(!email || !otp) return res.status(400).json({msg:"OTP is required"});

        const user = await User.findOne({email});
        if(!user) return res.status(400).json({msg:"User not found"})
        
        if(user.isVerified) return res.status(400).json({msg:"User already verified"});

        if(user.otp!=otp || user.otpExpiry < Date.now()){
            return res.status(400).json({msg:"Invalid or expired OTP"});
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        res.json({
            msg: "OTP verified successfully",
            accessToken
        });
    }
    catch(err){
        console.log(err)
        return res.json({error : "OTP verification failed"});
    }
}

async function handleResendOTP(req,res) {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.isVerified) return res.json({ message: "User already verified" });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;

        await user.save();

        // TODO: Send OTP via email
        await sendEmail(email, "Resent OTP", `Your new OTP is: ${otp}`);
        console.log(`Resent OTP for ${email}: ${otp}`);

        res.json({ message: "OTP resent successfully" });
  } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to resend OTP" });
  }
}

async function handleForgotPassword(req,res) {
    try{
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({error:"User not found"});

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() + 15*60*1000

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        await sendEmail(
            email,
            'Reset Password Link',
            `You requested a password reset. Click this link: ${resetLink}`
        );

        res.json({ msg: "Password reset link sent to your email" });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ msg: "Something went wrong" });
    }
}

async function handleLoginUser(req,res) {
    try{
        // const prompt = "Give a short story of turtle and rabbit in simple plain text only";
        // const result = await model.generateContent(prompt);
        // return res.json({result});

        const {email, password} = req.body;
        if(!email || !password) return res.status(400).json({msg:"Email and Password in required"})
        
        const user = await User.findOne({email});
        if(!user.isVerified) return res.status(400).json({msg:"User is not verified"});

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) return res.status(401).json({msg:"Invalid Password"});

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshTokens.push(refreshToken);
        user.lastLogin = Date.now();
        await user.save();

        res.cookie('refreshToken',refreshToken,{
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });

        res.json({
            msg:"Login Successful",
            accessToken
        });
    }
    catch(err){
        console.log(err);
        return res.status(500).json({error:"Login Failed"});
    }
}

async function handleResetPassword(req,res) {
    try{
        const {token} = req.params;
        const {newPassword} = req.body;

        if(!newPassword) return res.status(400).json({msg:"New password is required"});

        const user = await User.findOne({
            resetPasswordToken : token,
            resetPasswordExpires : { $gt : Date.now() }
        })

        if(!user){
            return res.status(400).json({msg:"Invalid or expired reset token"});
        }

        const hashedPassword = await bcrypt.hash(newPassword,10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({msg:"Password has been reset successfully"})
    }
    catch(err){
        console.log(err)
        return res.json({error:"Error resetting password"})
    }
}

async function handleRefreshToken(req,res) {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.staus(401).json({msg:"Refresh Token Missing"});

        const payload = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(payload.id);
        if(!user || !user.refreshTokens.includes(refreshToken)){
            return res.status(403).json({msg:"Invalid Refresh Token"});
        }

        user.refreshTokens = user.refreshTokens.filter((t) => t!= refreshToken);

        const newaccessToken = generateAccessToken(user);
        const newrefreshToken = generateRefreshToken(user);

        user.refreshTokens.push(newrefreshToken)
        await user.save();

        res.cookie('refreshToken',newrefreshToken,{
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        })

        res.json({accessToken : newaccessToken});
    }
    catch(err){
        console.log(err);
        res.status(403).json({error:"Invalid or expired refresh token"});
    }
}

async function handleLogoutUser(req,res) {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return res.status(401).json({msg:"Refresh token missing"});

        const payload = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);

        const user =  await User.findById(payload.id);
        if(!user) return res.status(403).json({msg:"Invalid User"});

        user.refreshTokens = user.refreshTokens.filter((t)=> t!=refreshToken);
        await user.save();

        res.clearCookie('refreshToken',{ httpOnly: true, sameSite: "lax", secure: false });
        res.json({msg:"Logged out Successfully"})
    }
    catch(err){
        console.error(err);
        res.status(403).json({ msg: "Invalid or expired refresh token" });
    }
}

module.exports = {
    handleSignupUser,
    handleVerifyOTP,
    handleResendOTP,
    handleForgotPassword,
    handleLoginUser,
    handleResetPassword,
    handleRefreshToken,
    handleLogoutUser
}