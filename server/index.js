const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fileRoutes = require("./routes/fileRoutes");
const userRoutes = require("./routes/userRoutes");

require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // 👈 correct frontend URL
    credentials: true, // 👈 if you're using cookies or sessions
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/files", fileRoutes);
app.use("/api", userRoutes);

// ✅ Connect to MongoDB the new way
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // 👈 No callback here
    console.log("✅ Connected to MongoDB");

    app.listen(5000, () => {
      console.log("🚀 Server running on http://localhost:5000");
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
};

startServer();
