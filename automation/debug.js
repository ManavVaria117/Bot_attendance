const puppeteer = require("puppeteer");
require("dotenv").config();

const autoDebug = async () => {
  const browser = await puppeteer.launch({ headless: false }); // headless: false for debugging
  const page = await browser.newPage();

  try {
    // console.log("Navigating to:", process.env.LOGIN_URL);

    // await page.goto(process.env.LOGIN_URL, { waitUntil: "networkidle2" });
    await page.goto("https://bureauveritas.onelogin.com/login2/?return=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXJhbXMiOnt9LCJtZXRob2QiOiJnZXQiLCJmZl9tdWx0aXBsZV9icmFuZHMiOnRydWUsIm5vdGlmaWNhdGlvbiI6eyJ0eXBlIjoiaW5mbyIsIm1lc3NhZ2UiOiJDb25uZWN0aW5nIHRvICoqQWxsU2VjaHJvIFVzZXIqKiIsInZhbHVlcyI6WyIqKkFsbFNlY2hybyBVc2VyKioiXSwidGVtcGxhdGVfaWQiOiJjb25uZWN0aW5nX3RvX2FwcCIsImljb24iOiJjb25uZWN0aW9uIn0sImJyYW5kX2lkIjoibWFzdGVyIiwidXJpIjoiaHR0cHM6Ly9idXJlYXV2ZXJpdGFzLm9uZWxvZ2luLmNvbS90cnVzdC9zYW1sMi9odHRwLXBvc3Qvc3NvLzA2NTM2NzhiLTBmMjUtNDhjYi1iNzM0LTQ1OGEwNWFjNzgxYj9zYW1sX3JlcXVlc3RfcGFyYW1zX3Rva2VuPWRkZGY5ZTcwNWYuZTljMzQ5ZjhjZDJjMTgyNmI0NmFlMDI4YmY4NmRlNjI3ZTFjZDc0My41YjRmMlNIUXJIQTNpcDEtOVRVMXJXS2ZDOEdhckxmQlRha1JWODNWYTBBJTNEIiwiaXNzIjoiTU9OT1JBSUwiLCJhdWQiOiJBQ0NFU1MiLCJhcHBfaWQiOiIwNjUzNjc4Yi0wZjI1LTQ4Y2ItYjczNC00NThhMDVhYzc4MWIiLCJleHAiOjE3NDU0NjYzNTR9.DvQoVcjXbq4QnV1GHfZBQf-E9EcNl2bU3B3ONbWI0uw#app=0653678b-0f25-48cb-b734-458a05ac781b", { waitUntil: "networkidle2" });


    // Step 1: Fill username and click continues
    await page.type("#username", "svaria"); // replace with actual selector
    await page.click(".sc-kPVwWT.duNpUs.sc-kpOJdX.duZYCT"); // replace with actual selector
    // await page.waitForTimeout(1000);
    await new Promise(resolve => setTimeout(resolve, 2000));


    // Step 2: Fill password and click continue
    await page.type("#password", "Maanv@a01"); // replace with actual selector
    await page.click(".sc-kPVwWT.duNpUs.sc-kpOJdX.duZYCT"); // replace with actual selector~
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    // Step 3: Click In or Out button based on time
    const now = new Date();
    const hour = now.getHours();

    if (hour === 8) {
      console.log("🟢 Attempting Clock-In");
      await page.click("#btnBiometericIN"); // replace with actual selector
    } else if (hour === 18) {
      console.log("🔴 Attempting Clock-Out");
      await page.click("#btnBiometericOUT"); // replace with actual selector
    } else {
      console.log("⏰ Not clock-in or clock-out time.");
    }

    // await page.waitForTimeout(2000); // wait a bit before closing
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (err) {
    console.error("❌ Debugging failed:", err.message);
  } finally {
    await browser.close();
  }
};

autoDebug();
