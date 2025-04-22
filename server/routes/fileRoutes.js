const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerConfig");
const {
  createFolder,
  uploadFile,
  getFiles,
} = require("../controllers/fileController");
const File = require("../models/File");

// Create folder
router.post("/folder", createFolder);

// Upload file
router.post("/upload", upload.single("file"), uploadFile);

// Get files in a folder
router.get("/", getFiles);

// 👇 New route to get a file/folder's detail (used in breadcrumb)
router.get("/detail", async (req, res) => {
  try {
    const file = await File.findById(req.query.id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }
    res.json(file);
  } catch (err) {
    console.error("❌ Error in /files/detail:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
