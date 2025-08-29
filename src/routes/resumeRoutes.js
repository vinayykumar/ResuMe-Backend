const express = require("express");
const router = express.Router();
const { uploadResume } = require("../controllers/resumeController");
const upload = require("../middleware/multer");
const verifyToken = require("../middleware/verifyToken");

router.post("/upload", verifyToken, upload.single("resume"), uploadResume);

module.exports = router;