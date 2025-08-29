const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
