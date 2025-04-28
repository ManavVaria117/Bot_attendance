const express = require("express");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5001;
const logRoutes = require("./routes/logRoutes");
const Log = require("./models/Log"); // ✅ Your Log model
const cors = require("cors");


// Start scheduler
require("./scheduler");

app.use(cors({
  origin: "http://localhost:3000", // your frontend URL
  credentials: true
}));app.use("/api/logs", logRoutes);
// app.use('/api/logs', require('./routes/logRoutes')); // This handles both /logs and /logs/stats


app.get("/", (req, res) => {
    console.log("Root route hit");
    res.send("Automation service is running.");
});

app.get("/api/logs/stats", async (req, res) => {
  try {
    const successCount = await Log.countDocuments({ status: "success" });
    const failCount = await Log.countDocuments({ status: "failure" });
    const lastLog = await Log.findOne().sort({ createdAt: -1 });

    res.json({
      successCount,
      failCount,
      lastRun: lastLog?.createdAt || null
    });
  } catch (err) {
    console.error("Stats route error:", err.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});
  
const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB error:", err));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});