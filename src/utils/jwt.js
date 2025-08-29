const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET

function generateAccessToken(user) {
    return jwt.sign({ id: user._id, email: user.email },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" },
    );
};

function generateRefreshToken(user) {
    return jwt.sign({ id: user._id, email: user.email },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" },
    );
};

module.exports = {generateAccessToken, generateRefreshToken}