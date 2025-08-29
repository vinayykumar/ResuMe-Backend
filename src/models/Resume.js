const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  user:          { type: String, required: true }, // manual userId instead of ObjectId
  originalName:  { type: String },
  cloudinaryUrl: { type: String },
  cloudinaryId:  { type: String },
  fileType:      { type: String },
  parsedText:    { type: String, select: false }, 
  jobDescription:{ type: String },
  aiScore:       { type: Number },
  aiFeedback:    { type: mongoose.Schema.Types.Mixed },
  keywords:      [String],
}, { timestamps: true });

module.exports = mongoose.model("Resume", ResumeSchema);
