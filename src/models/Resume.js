const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  user:          { type: String, required: true }, // manual userId instead of ObjectId
  originalName:  { type: String },
  cloudinaryUrl: { type: String },
  cloudinaryId:  { type: String },
  fileType:      { type: String },
  parsedText:    { type: String, select: false },

  // New fields
  jobTitle:      { type: String, default: "" },
  jobDescription:{ type: String, default: "" },

  // AI analysis fields
  aiScore:       { type: Number, default: 0 },
  aiFeedback: {
    Strengths_Resume: { type: [String], default: [] },
    Weakness_Resume:  { type: [String], default: [] }
  },
  keywords:      { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model("Resume", ResumeSchema);
