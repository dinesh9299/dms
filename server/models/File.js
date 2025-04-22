const mongoose = require("mongoose");
const fileSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ["file", "folder"] },
  path: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "File", default: null },
});
module.exports = mongoose.model("File", fileSchema);
