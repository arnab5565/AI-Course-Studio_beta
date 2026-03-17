const express = require("express");
const router = express.Router();
const { generateSyllabus, generateChapter } = require("../controllers/geminiController");

router.post("/syllabus", generateSyllabus);
router.post("/chapter", generateChapter);

module.exports = router;