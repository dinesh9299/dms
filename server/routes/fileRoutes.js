const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerConfig");
const path = require("path");
const {
  createFolder,
  uploadFile,
  getFiles,
  deleteItem,
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

router.delete("/:id", deleteItem); // 👈 Add this at the end

router.post("/delete-multiple", async (req, res) => {
  const { ids } = req.body;
  try {
    await File.deleteMany({ _id: { $in: ids } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/rename", async (req, res) => {
  const { id, newName } = req.body;
  try {
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ error: "File not found" });

    file.name = newName;
    await file.save();
    res.json({ success: true, file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Force download route
router.get("/download/:filename/:name", (req, res) => {
  const filename = req.params.filename; // The actual file on disk
  const displayName = req.params.name; // The name the user sees/downloads

  const filePath = path.join(__dirname, "../uploads", filename);

  res.download(filePath, displayName, (err) => {
    if (err) {
      console.error("Download failed:", err.message);
      res.status(500).send("Failed to download file.");
    }
  });
});

router.get("/file/:id", async (req, res) => {
  const file = await File.findById(req.params.id);
  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }
  res.json(file);
});

module.exports = router;
