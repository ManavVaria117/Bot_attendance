// install-chrome.js
const { exec } = require('child_process');

exec('node node_modules/puppeteer/install.js', (err, stdout, stderr) => {
  if (err) {
    console.error('Failed to install Chromium for Puppeteer:', err);
    process.exit(1);
  }
  console.log('Chromium installed successfully for Puppeteer.');
});
