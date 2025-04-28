const puppeteer = require("puppeteer");
require("dotenv").config();

const mode = process.argv[2] || "clockin"; // Pass 'clockin' or 'clockout' as argument

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    const continueBtnClass = ".sc-kPVwWT.duNpUs.sc-kpOJdX.duZYCT";
    const inBtn = "#btnBiometericIN";
    const outBtn = "#btnBiometericOUT";

    console.log("🌐 Navigating to:", "    https://bureauveritas.onelogin.com/client/apps/select/1511158051");
    await page.goto("https://bureauveritas.onelogin.com/client/apps/select/1511158051", { waitUntil: "networkidle2" });

    // https://bureauveritas.onelogin.com/client/apps/select/1511158051

    console.log("👤 Typing username...");
    await page.type("input[name='username']", "svaria");
    await page.waitForSelector(continueBtnClass, { timeout: 5000 });
    await page.click(continueBtnClass);
    await sleep(2000);

    console.log("🔒 Typing password...");
    await page.type("input[name='password']", "Maanv@a01");
    await page.waitForSelector(continueBtnClass, { timeout: 5000 });
    await page.click(continueBtnClass);
    await sleep(3000);

    if (mode === "clockin") {
      console.log("🟢 Clicking IN button...");
      await page.waitForSelector(inBtn, { timeout: 5000 });
      await page.click(inBtn);
    } else {
      console.log("🔴 Clicking OUT button...");
      await page.waitForSelector(outBtn, { timeout: 5000 });
      await page.click(outBtn);
    }

    console.log(`✅ ${mode.toUpperCase()} button clicked successfully.`);
  } catch (err) {
    console.error("❌ Debugging failed:", err.message);
  } finally {
    await sleep(4000);
    await browser.close();
  }
})();
