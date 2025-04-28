const express = require("express");
const router = express.Router();
const Log = require("../models/Log"); // Import the Log model

// Get all logs
router.get("/", async (req, res) => {
  try {
    const logs = await Log.find(); // Fetch all logs from the database
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const successCount = await Log.countDocuments({ status: "success" });
    const failCount = await Log.countDocuments({ status: "failure" });
    const lastLog = await Log.findOne().sort({ timestamp: -1 });

    res.json({
      successCount,
      failCount,
      lastRun: lastLog?.timestamp || null,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});


module.exports = router;
