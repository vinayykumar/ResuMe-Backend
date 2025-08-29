const express = require("express");
const router = express.Router();
const { uploadResume } = require("../controllers/resumeController");
const upload = require("../middlewares/upload");
// const verifyToken = require("../middleware/verifyToken");

router.post("/upload", upload.single("resume"), uploadResume);

module.exports = router;    