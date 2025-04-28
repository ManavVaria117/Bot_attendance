const cron = require("node-cron");
const puppeteer = require("puppeteer");
const Log = require("../models/Log");
const sendEmail = require("../utils/emailService");
require("dotenv").config();
const connectDB = require("../config/db");
connectDB(); // Ensure DB connection is established before anything else

const mode = process.argv[2] || "clockin"; // Pass 'clockin' or 'clockout' as argument

// Logging function
const logAction = async (action, status, message) => {
  try {
    await Log.create({ action, status, message });
    console.log("✅ Automation app is running at", new Date().toLocaleString());

  } catch (err) {
    console.error("❌ Error logging action:", err.message);
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to automate login/logout and clicking the buttons

const automateLoginLogout = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const continueBtnClass = ".sc-kPVwWT.duNpUs.sc-kpOJdX.duZYCT";
    const inBtn = "#btnBiometericIN";
    const outBtn = "#btnBiometericOUT";

    console.log("🌐 Navigating to:", "    https://bureauveritas.onelogin.com/client/apps/select/1511158051");
    await page.goto(process.env.LOGIN_URL , { waitUntil: 'networkidle2' });

    // https://bureauveritas.onelogin.com/client/apps/select/1511158051

    console.log("👤 Typing username...");
    await page.type('#username', process.env.FIX);
    await page.waitForSelector(continueBtnClass, { timeout: 5000 });
    await page.click(continueBtnClass);
    await sleep(2000);

    console.log("🔒 Typing password...");
    await page.type('#password', process.env.PASSWORD);
    await page.waitForSelector(continueBtnClass, { timeout: 5000 });
    await page.click(continueBtnClass);
    await sleep(3000);

    if (mode === 'clockin') {
      console.log("🟢 Clicking IN button...");
      await page.waitForSelector(inBtn, { timeout: 5000 });
      await page.click(inBtn);
    } else if (mode === 'clockout') {
      console.log("🔴 Clicking OUT button...");
      await page.waitForSelector(outBtn, { timeout: 5000 });
      await page.click(outBtn);
    }

    await browser.close();
    return { success: true, message: `${mode} automation completed.` };
  } catch (error) {
    console.error("❌ Error during automation:", error.message);
    await browser.close();
    return { success: false, message: error.message };
  }
};
//     console.log(`✅ ${mode.toUpperCase()} button clicked successfully.`);
//   } catch (err) {
//     console.error("❌ Debugging failed:", err.message);
//   } finally {
//     await sleep(4000);
//     await browser.close();
//   }
// };

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
  runAutomation('clockin');
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



