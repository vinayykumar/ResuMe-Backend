const express = require('express')
const router = express.Router();
const {handleSignupUser, 
        handleVerifyOTP, 
        handleResendOTP,
        handleForgotPassword,
        handleLoginUser,
        handleResetPassword, 
        handleRefreshToken,
        handleLogoutUser
    } = require('../controllers/authController')

router.post('/signup',handleSignupUser);

router.post('/verify-otp',handleVerifyOTP);

router.post('/resend-otp',handleResendOTP);

router.post('/forgot-password/',handleForgotPassword);

router.post('/login',handleLoginUser);

router.post('/reset-password/:token',handleResetPassword);

router.post('/refresh',handleRefreshToken);

router.post('/logout',handleLogoutUser);

module.exports = router;