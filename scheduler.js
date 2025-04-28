const cron = require("node-cron");
const puppeteer = require("puppeteer");
const Log = require("./models/Log");
const sendEmail = require("./utils/emailService");
require("dotenv").config();
const connectDB = require("./config/db");
connectDB(); // Ensure DB connection is established before anything else


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
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("🌐 Navigating to the login page...");
    await page.goto(process.env.LOGIN_URL , { waitUntil: 'networkidle2' });

    // Type username and password and click continue
    console.log("👤 Typing username...");
    await page.type('#username', process.env.FIX); // Update with your username selector
    // await page.screenshot({ path: "debug4.png", fullPage: true });

    await page.click('.sc-kPVwWT.duNpUs.sc-kpOJdX.duZYCT'); // Update with continue button class selector
    // await page.waitForTimeout(2000); // Wait for password field to appear
    await new Promise(resolve => setTimeout(resolve, 2000));


    console.log("🔒 Typing password...");
    await page.type('#password', process.env.PASSWORD); // Update with your password selector
    await page.click('.sc-kPVwWT.duNpUs.sc-kpOJdX.duZYCT'); // Update with continue button class selector
    // await page.waitForTimeout(2000); // Wait for the next page to load
    await new Promise(resolve => setTimeout(resolve, 2000));


    if (mode === 'clockin') {
      console.log("🟢 Clicking CLOCK-IN button...");
      // Wait for a page element that confirms login was successful
      // await page.waitForNavigation({ waitUntil: 'networkidle2' }); // ensures page has finished loading

      // OR wait for a known element on the dashboard to appear
      await page.waitForSelector("#btnBiometericIN", { visible: true, timeout: 30000 });
      console.log("Waiting for IN button to appear...");

      // THEN click
      await page.click('#btnBiometericIN'); // Update with your Clock-In button ID
      // await page.waitForTimeout(2000); // Wait after clicking the button
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log("✅ CLOCK-IN button clicked successfully.");
    } else if (mode === 'clockout') {
      console.log("🔴 Clicking CLOCK-OUT button...");
      // Wait for a page element that confirms login was successful
      await page.screenshot({ path: "debug5.png", fullPage: true });

      await page.waitForNavigation({ waitUntil: 'networkidle2' }); // ensures page has finished loading
      // OR wait for a known element on the dashboard to appear

      await page.waitForSelector("#btnBiometericOUT", { visible: true, timeout: 30000 });


      // THEN click
      await page.click('#btnBiometericOUT'); // Update with your Clock-Out button ID
      // await page.waitForTimeout(2000); // Wait after clicking the button
      await new Promise(resolve => setTimeout(resolve, 2000));

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
const clockinTime = process.env.CLOCKIN_TIME;
const clockoutTime = process.env.CLOCKOUT_TIME;

// Validate times
if (!clockinTime || !clockoutTime) {
  console.error("❌ CLOCKIN_TIME or CLOCKOUT_TIME not set in .env file.");
  process.exit(1);
}

// ⏰ Schedule clock-in at 8:00 AM based on CLOCKIN_TIME
cron.schedule(clockinTime, () => {
  console.log("🟢 Running scheduled CLOCK-IN automation...");
  runAutomation("clockin");
});

// ⏰ Schedule clock-out at 6:00 PM based on CLOCKOUT_TIME
cron.schedule(clockoutTime, () => {
  console.log("🔴 Running scheduled CLOCK-OUT automation...");
  runAutomation("clockout");
});

// cron.schedule(clockinTime, () => {
//   console.log("🟢 CLOCK-IN triggered...");
//   runAutomation("clockin");
// });

// cron.schedule(clockoutTime, () => {
//   console.log("🔴 CLOCK-OUT triggered...");
//   runAutomation("clockout");
// });

console.log("🚀 Scheduler is running. Clock-in and Clock-out times are controlled by .env.");

module.exports = { runAutomation };

