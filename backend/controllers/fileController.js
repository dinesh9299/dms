const File = require("../../server/models/File");
const path = require("path");
const fs = require("fs");

exports.createFolder = async (req, res) => {
  const { name, parentId } = req.body;
  const folderPath = parentId
    ? path.join("uploads", name)
    : path.join("uploads", name);

  try {
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
  const { name, parentId } = req.body;

  const file = new File({
    name,
    type: "file",
    path: req.file.path,
    parent: parentId || null,
  });

  await file.save();
  res.status(201).json(file);
};

exports.getFiles = async (req, res) => {
  const { parentId } = req.query;
  const files = await File.find({ parent: parentId || null });
  res.json(files);
};
