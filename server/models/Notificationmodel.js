const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  message: String,
  parent: String,
  time: Date,
  recipients: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      seen: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

module.exports = mongoose.model("Notification", NotificationSchema);
