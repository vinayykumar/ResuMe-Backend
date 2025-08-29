require('dotenv').config();
const cloudinary = require("cloudinary").v2;
const Resume = require("../models/Resume");
const pdfParse = require("pdf-parse");
const { Readable } = require("stream");
const { analyzeResume } = require("../utils/gemini");


function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

async function uploadResume(req, res) {
  try {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    const { jobTitle, jobDescription } = req.body;
    if(!jobTitle || !jobDescription) return res.status(400).json({ msg: "Job title and description are required" });


    //Upload to Cloudinary directly from buffer
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {resource_type: "auto" },
        (err, uploaded) => {
          if (err) reject(err);
          else resolve(uploaded);
        }
      );
      bufferToStream(req.file.buffer).pipe(stream);
    });

    //Parse PDF text from buffer
    const pdfData = await pdfParse(req.file.buffer);

    const aiResponse = await analyzeResume(pdfData.text, jobTitle, jobDescription);
    const { aiScore, aiFeedback, keywords } = aiResponse;

    //Save resume in DB
    const resume = new Resume({
      user: req.user.id,
      originalName: req.file.originalname, 
      cloudinaryUrl: result.secure_url,
      cloudinaryId: result.public_id,
      fileType: req.file.mimetype,
      parsedText: pdfData.text,
      jobTitle,
      jobDescription,
      aiScore,
      aiFeedback,
      keywords
    });

    await resume.save();

    return res.json({ msg: "Resume uploaded successfully", resume });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ msg: "Resume upload failed", error: err.message });
  }
}

module.exports = { uploadResume };
