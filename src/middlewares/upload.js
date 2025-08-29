const multer = require("multer");

// Store file in memory, not on disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
