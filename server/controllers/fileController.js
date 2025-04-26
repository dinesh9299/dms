const File = require("../models/File");
const path = require("path");
const fs = require("fs");
const Notificationmodel = require("../models/Notificationmodel");
const User = require("../models/User");

exports.createFolder = async (req, res) => {
  const { name, parentId } = req.body;
  const folderPath = parentId
    ? path.join("uploads", name) // Optionally include parent path logic here
    : path.join("uploads", name);

  const existingFile = await File.findOne({
    name,
    parent: parentId || null,
    type: "folder",
  });

  if (existingFile) {
    console.log("file");
    return res.status(204).json({ error: "Folder already exists" });
  }
  try {
    // Check if the folder already exists
    // if (fs.existsSync(folderPath)) {
    //   return res.status(204).json({ error: "Folder already exists" });
    // }

    fs.mkdirSync(folderPath, { recursive: true });

    const folder = new File({
      name,
      type: "folder",
      path: folderPath,
      parent: parentId || null,
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadFile = async (req, res) => {
  const { name, parentId, filetype, size, createdtime, parentpath } = req.body;

  try {
    const existingFile = await File.findOne({
      name,
      parent: parentId || null,
      type: "file",
    });

    if (existingFile) {
      return res.json({
        error: `File with the same name "${name}" already exists in this folder.`,
        success: false,
      });
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    const file = new File({
      name,
      type: "file",
      filetype,
      path: fileUrl,
      parent: parentId || null,
      size,
      createdtime,
    });

    await file.save();

    // Create recipients list for notification
    const allUsers = await User.find(); // get all users
    const recipients = allUsers.map((user) => ({
      userId: user._id,
      seen: false,
    }));

    const notification = new Notificationmodel({
      message: `${name}`,
      time: new Date(),
      recipients: recipients,
      parent: parentpath,
    });

    await notification.save();

    // Emit real-time notification
    const io = req.app.get("io"); // Get io instance from the request
    io.emit("new_notification", notification); // Emit the notification

    console.log("notification", notification);

    // ✅ Finally respond
    return res.status(201).json({
      file: file,
      success: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

exports.markNotificationAsSeen = async (req, res) => {
  const { notifId } = req.params;
  const { userId } = req.body;

  try {
    const notification = await Notificationmodel.findById(notifId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    const recipient = notification.recipients.find(
      (r) => r.userId.toString() === userId
    );

    if (!recipient) {
      return res
        .status(404)
        .json({ message: "User is not a recipient of this notification" });
    }

    if (!recipient.seen) {
      recipient.seen = true;
      await notification.save();
    }

    res.json({ message: "Notification marked as seen", success: true });
  } catch (err) {
    console.error("Error updating notification:", err);
    res.status(500).json({ message: "Internal server error", success: false });
  }
};

exports.getFiles = async (req, res) => {
  const { parentId } = req.query;
  const files = await File.find({ parent: parentId || null });
  res.json(files);
};

exports.getallfiles = async (req, res) => {
  const files = await File.find({});
  res.json(files);
};

exports.deleteItem = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await File.findById(id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    // If it's a folder, delete all child items recursively
    if (item.type === "folder") {
      const deleteRecursive = async (parentId) => {
        const children = await File.find({ parent: parentId });
        for (const child of children) {
          if (child.type === "folder") {
            await deleteRecursive(child._id);
          } else {
            const filename = path.basename(child.path);
            const filePath = path.join(__dirname, "../uploads", filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          }
          await File.findByIdAndDelete(child._id);
        }
      };

      await deleteRecursive(item._id);
    }

    // If it's a file, delete from disk
    if (item.type === "file") {
      const filename = path.basename(item.path);
      const filePath = path.join(__dirname, "../uploads", filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // Finally, delete the folder or file record itself
    await File.findByIdAndDelete(id);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: err.message });
  }
};
