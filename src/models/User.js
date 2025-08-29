const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Verification
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,

  // Refresh token storage
  refreshTokens: { type: [String], default: [] },

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Last login
  lastLogin: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
