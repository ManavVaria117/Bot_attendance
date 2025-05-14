const cron = require("node-cron");
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealthPlugin());
const Log = require("./models/Log");
const sendEmail = require("./utils/emailService");
require("dotenv").config();
const connectDB = require("./config/db");
connectDB(); // Ensure DB connection is established before anything else

// const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Logging function
const logAction = async (action, status, message) => {
  try {
    await Log.create({ action, status, message });
    console.log("✅ Automation app is running at", new Date().toLocaleString());

  } catch (err) {
    console.error("❌ Error logging action:", err.message);
  }
};

// Function to automate login/logout and clicking the buttons
const automateLoginLogout = async (mode) => {
const browser = await puppeteer.launch({
    headless: true, // or "new"
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1366, height: 768 });
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });

  await page.goto(process.env.LOGIN_URL, { waitUntil: 'networkidle2' });

  try {
    console.log("🌐 Navigating to the login page...");
    await page.goto(process.env.LOGIN_URL , { waitUntil: 'networkidle2' })

    // Type username and password and click continue
    console.log("👤 Typing username...");
    await page.type('#username', process.env.FIX); // Update with your username selector
    await new Promise(resolve => setTimeout(resolve, 5000)); // 🕐 Wait 5s to simulate human pause
    await page.waitForSelector('.sc-kPVwWT.duNpUs.sc-kpOJdX.duZYCT', { timeout: 5000 });    
    await page.click('.sc-kPVwWT.duNpUs.sc-kpOJdX.duZYCT'); // Update with continue button class selector
    // await page.waitForTimeout(2000); // Wait for password field to appear
    await new Promise(resolve => setTimeout(resolve, 10000));


    console.log("🔒 Typing password...");
    await page.type('#password', process.env.PASSWORD); // Update with your password selector
    await new Promise(resolve => setTimeout(resolve, 5000)); // 🕐 Wait 5s to simulate human pause
    await page.waitForSelector('.sc-kPVwWT.duNpUs.sc-kpOJdX.duZYCT', { timeout: 5000 });    
    // await page.screenshot({ path: "debug7.png", fullPage: true });

    await page.click('.sc-kPVwWT.duNpUs.sc-kpOJdX.duZYCT'); // Update with continue button class selector
    // await page.waitForTimeout(2000); // Wait for the next page to load
    await new Promise(resolve => setTimeout(resolve, 10000));


    if (mode === 'clockin') {
      console.log("🟢 Clicking CLOCK-IN button...");
      await page.waitForSelector("#btnBiometericIN", { timeout: 5000 });
      console.log("Waiting for IN button to appear...");

      // THEN click
      await page.click('#btnBiometericIN'); // Update with your Clock-In button ID
      // await page.waitForTimeout(2000); // Wait after clicking the button
      await new Promise(resolve => setTimeout(resolve, 10000));

      console.log("✅ CLOCK-IN button clicked successfully.");
    } else {
      console.log("🔴 Clicking CLOCK-OUT button...");
      // Wait for a page element that confirms login was successful
      await page.waitForSelector("#btnBiometericOUT", { timeout: 5000 });
      await page.click('#btnBiometericOUT'); // Update with your Clock-Out button ID      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log("✅ CLOCK-OUT button clicked successfully.");
    }

    await browser.close();
    return { success: true, message: `${mode} automation completed.` };
  } catch (error) {
    console.error("❌ Error during automation:", error.message);
    await browser.close();
    return { success: false, message: error.message };
  }
};

const runAutomation = async (mode) => {
  console.log(`Running automation for: ${mode}`);
  const result = await automateLoginLogout(mode); // mode is "clockin" or "clockout"
  console.log(result.message); // See the message after automation

  await logAction(mode, result.success ? "success" : "failure", result.message);

  // Send email alert
  const subject = result.success
    ? `✅ ${mode.toUpperCase()} Successful`
    : `❌ ${mode.toUpperCase()} Failed`;

  const message = result.message;
  await sendEmail(subject, message);
};

// Read dynamic times from .env
const clockinTime = process.env.CLOCKIN_TIME ||"10 2 * * 1-5";
const clockoutTime = process.env.CLOCKOUT_TIME ||"10 12 * * 1-5";

// Validate times
if (!clockinTime || !clockoutTime) {
  console.error("❌ CLOCKIN_TIME or CLOCKOUT_TIME not set in .env file.");
  process.exit(1);
}

// 🎲 Function to get random delay between 0–10 mins
const getRandomDelay = () => {
  const delayMinutes = Math.floor(Math.random() * 11); // 0 to 10 minutes
  return delayMinutes * 60 * 1000;
};

// ⏰ Schedule clock-in at exactly 8:00 AM, then wait random delay
cron.schedule(clockinTime, () => {
  const delay = getRandomDelay();
  console.log(`🕗 CLOCK-IN scheduled with ${delay / 60000} minute delay`);
  setTimeout(() => {
    runAutomation("clockin");
  }, delay);
});

// runAutomation("clockin")

// // ⏰ Schedule clock-in at 8:00 AM based on CLOCKIN_TIME
// cron.schedule(clockinTime, () => {
//   console.log("🟢 Running scheduled CLOCK-IN automation...");
//   runAutomation("clockin");
// });

// ⏰ Schedule clock-out at exactly 6:00 PM, then wait random delay
cron.schedule(clockoutTime, () => {
  const delay = getRandomDelay();
  console.log(`🕕 CLOCK-OUT scheduled with ${delay / 60000} minute delay`);
  setTimeout(() => {
    runAutomation("clockout");
  }, delay);
});

// // ⏰ Schedule clock-out at 6:00 PM based on CLOCKOUT_TIME
// cron.schedule(clockoutTime, () => {
//   console.log("🔴 Running scheduled CLOCK-OUT automation...");
//   runAutomation("clockout");
// });

console.log("🚀 Scheduler is running. Clock-in and Clock-out times are controlled by .env.");

module.exports = { runAutomation };
