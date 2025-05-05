const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Simple homepage
app.get('/', (req, res) => {
  res.send('🚀 Automation Bot is running successfully!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Web server is running on PORT: ${PORT}`);
});

// Also start your bot
require('./patch'); // <-- your scheduler bot file
