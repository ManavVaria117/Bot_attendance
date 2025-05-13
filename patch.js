const cron = require("node-cron");
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealthPlugin());const Log = require("./models/Log");
const sendEmail = require("./utils/emailService");
require("dotenv").config();
const connectDB = require("./config/db");
connectDB(); // Ensure DB connection is established before anything else

const logAction = async (action, status, message) => {
  try {
    await Log.create({ action, status, message });
    console.log("✅ Logged:", action, status, message);
  } catch (err) {
    console.error("❌ Logging failed:", err.message);
  }
};

const automateLoginLogout = async (mode) => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  try {
    await page.goto(process.env.LOGIN_URL, { waitUntil: 'networkidle2' });
    await page.type('#username', process.env.FIX);
    await page.waitForSelector(process.env.CONTINUE_BUTTON, { timeout: 5000 });
    await page.click(process.env.CONTINUE_BUTTON);
    await page.waitForTimeout(2000);
    await page.type('#password', process.env.PASSWORD);
    await page.waitForSelector(process.env.CONTINUE_BUTTON, { timeout: 5000 });
    await page.click(process.env.CONTINUE_BUTTON);
    await page.waitForTimeout(2000);

    if (mode === 'clockin') {
      await page.waitForSelector("#btnBiometericIN", { timeout: 5000 });
      await page.click("#btnBiometericIN");
      await page.waitForTimeout(2000);
    } else {
      await page.waitForSelector("#btnBiometericOUT", { timeout: 5000 });
      await page.click("#btnBiometericOUT");
      await page.waitForTimeout(2000);
    }

    await browser.close();
    return { success: true, message: `${mode.toUpperCase()} completed.` };
  } catch (error) {
    await browser.close();
    return { success: false, message: `Automation error: ${error.message}` };
  }
};

const runAutomation = async (mode) => {
  const result = await automateLoginLogout(mode);
  console.log(result.message);
  await logAction(mode, result.success ? "success" : "failure", result.message);

  const subject = result.success ? `✅ ${mode.toUpperCase()} Success` : `❌ ${mode.toUpperCase()} Failed`;
  await sendEmail(subject, result.message);
};

// Scheduler only if not running from GitHub Action
const clockinTime = process.env.CLOCKIN_TIME;
const clockoutTime = process.env.CLOCKOUT_TIME;

const getRandomDelay = () => Math.floor(Math.random() * 11) * 60 * 1000; // 0-10 mins

const scheduleJobs = () => {
  if (!clockinTime || !clockoutTime) {
    console.error("❌ CLOCKIN_TIME or CLOCKOUT_TIME not set");
    return;
  }

  cron.schedule(clockinTime, () => {
    const delay = getRandomDelay();
    console.log(`🕗 Scheduled CLOCK-IN in ${delay / 60000} min`);
    setTimeout(() => runAutomation("clockin"), delay);
  });

  cron.schedule(clockoutTime, () => {
    const delay = getRandomDelay();
    console.log(`🕕 Scheduled CLOCK-OUT in ${delay / 60000} min`);
    setTimeout(() => runAutomation("clockout"), delay);
  });

  console.log("📅 Scheduler started");
};

// CLI Support for GitHub Actions
const mode = process.argv[2];
if (mode === "clockin" || mode === "clockout") {
  runAutomation(mode);
} else {
  scheduleJobs();
}

module.exports = { runAutomation };
