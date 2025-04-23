const mongoose = require("mongoose");
const fileSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ["file", "folder"] },
  path: String,
  filetype: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "File", default: null },
  size: String,
  createdtime: Date,
});
module.exports = mongoose.model("File", fileSchema);
