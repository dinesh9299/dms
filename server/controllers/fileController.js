const File = require("../models/File");
const path = require("path");
const fs = require("fs");

exports.createFolder = async (req, res) => {
  const { name, parentId } = req.body;
  const folderPath = parentId
    ? path.join("uploads", name) // Optionally include parent path logic here
    : path.join("uploads", name);

  try {
    // Check if the folder already exists
    if (fs.existsSync(folderPath)) {
      return res.status(204).json({ error: "Folder already exists" });
    }

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
  const { name, parentId, filetype, size, createdtime } = req.body;

  try {
    // 🔍 Check if a file with the same name exists under the same parent
    const existingFile = await File.findOne({
      name,
      parent: parentId || null,
      type: "file",
    });

    if (existingFile) {
      return res.json({
        error: "File with the same name already exists in this folder.",
        success: false,
      });
    }

    // ✅ Build a public-facing URL
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
    res.status(201).json({
      file: file,
      success: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFiles = async (req, res) => {
  const { parentId } = req.query;
  const files = await File.find({ parent: parentId || null });
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
