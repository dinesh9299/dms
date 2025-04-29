const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerConfig");
const path = require("path");
const fs = require("fs");
const {
  createFolder,
  uploadFile,
  getFiles,
  deleteItem,
  markNotificationAsSeen,
  getallfiles,
} = require("../controllers/fileController");
const File = require("../models/File");
const Notificationmodel = require("../models/Notificationmodel");

// Create folder
router.post("/folder", createFolder);

// Upload file
router.post("/upload", upload.single("file"), uploadFile);

// Get files in a folder
router.get("/", getFiles);

router.get("/allfiles", getallfiles);

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
    // Recursive function to delete folder contents
    const deleteRecursive = async (parentId) => {
      const children = await File.find({ parent: parentId });

      // For all children, delete in parallel
      await Promise.all(
        children.map(async (child) => {
          if (child.type === "folder") {
            await deleteRecursive(child._id);
          } else {
            const filename = path.basename(child.path);
            const filePath = path.join(__dirname, "../uploads", filename);
            try {
              if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (fileError) {
              console.error("Failed to delete file:", fileError);
            }
          }
          await File.findByIdAndDelete(child._id);
        })
      );
    };

    // For all top-level ids, delete in parallel
    await Promise.all(
      ids.map(async (id) => {
        const item = await File.findById(id);
        if (!item) return;

        if (item.type === "folder") {
          await deleteRecursive(item._id);
        } else if (item.type === "file") {
          const filename = path.basename(item.path);
          const filePath = path.join(__dirname, "../uploads", filename);
          try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          } catch (fileError) {
            console.error("Failed to delete file:", fileError);
          }
        }

        await File.findByIdAndDelete(id);
      })
    );

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete multiple error:", err);
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

router.get("/notification/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notificationmodel.find({
      "recipients.userId": userId,
    })
      .sort({ time: -1 })
      .lean();

    // Filter and simplify data
    const userNotifications = notifications.map((notification) => {
      const recipient = notification.recipients.find(
        (r) => r.userId.toString() === userId
      );
      return {
        _id: notification._id,
        message: notification.message,
        parent: notification.parent,
        time: notification.time,
        seen: recipient?.seen || false,
      };
    });

    res.json(userNotifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.post("/mark-seen/:notifId", markNotificationAsSeen);

module.exports = router;
