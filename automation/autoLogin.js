// const puppeteer = require("puppeteer");

// const autoLoginLogout = async () => {
//   const browser = await puppeteer.launch({ headless: true });  // Set headless: false for debugging
//   const page = await browser.newPage();
  
//   try {
//     // Go to the login page
//     await page.goto(process.env.LOGIN_URL); // Ensure LOGIN_URL is set in your .env file
    
//     // Perform login
//     await page.type("#username", process.env.USERNAME); // Replace with actual username field selector
//     await page.type("#password", process.env.PASSWORD); // Replace with actual password field selector
//     await page.click(".sc-kPVwWT duNpUs sc-kpOJdX duZYCT"); // Replace with actual login button selector
//     await page.waitForNavigation({ waitUntil: "networkidle0" });  // Wait for navigation to complete after login

//     // Check if login was successful (adjust the selector for success message)
//     const loginMessage = await page.$eval(".welcome-message", el => el.textContent);
    
//     if (loginMessage.includes("Welcome")) {
//       console.log("Login successful");

//       // Wait for some time before clocking in (adjust if necessary)
//       await page.waitForTimeout(5000);  // Wait 5 seconds before clocking in

//       // Click the clock-in button
//       await page.click("#btnBiometericIN"); // Replace with actual clock-in button selector
//       console.log("Clocked in");

//       // Wait for some time before clocking out (adjust if necessary)
//       await page.waitForTimeout(5000);  // Wait 5 seconds before clocking out

//       // Click the clock-out button
//       await page.click("#btnBiometericOUT"); // Replace with actual clock-out button selector
//       console.log("Clocked out");

//       await browser.close();
//       return { success: true, message: "Login, clock-in, and clock-out completed successfully" };
//     } else {
//       console.log("Login failed");
//       await browser.close();
//       return { success: false, message: "Login failed" };
//     }
//   } catch (error) {
//     console.error("Error during automation:", error.message);
//     await browser.close();
//     return { success: false, message: error.message };
//   }
// };

// module.exports = autoLoginLogout;

const puppeteer = require("puppeteer");
require("dotenv").config(); // Load environment variables

const loginAndClick = async (action) => {
  const browser = await puppeteer.launch({ headless: true });  // Set to false for debugging
  const page = await browser.newPage();

  try {
    await page.goto(process.env.LOGIN_URL, { waitUntil: "networkidle0" });

    await page.type("#username", process.env.USERNAME); // Replace as needed
    await page.type("#password", process.env.PASSWORD); // Replace as needed
    await page.click(".sc-kPVwWT.duNpUs.sc-kpOJdX.duZYCT"); // Adjust selector

    await page.waitForNavigation({ waitUntil: "networkidle0" });

    console.log(`✅ Logged in successfully for ${action}`);

    if (action === "clockIn") {
      await page.click("#btnBiometericIN");
      console.log("🕗 Clocked IN");
    } else if (action === "clockOut") {
      await page.click("#btnBiometericOUT");
      console.log("🕕 Clocked OUT");
    }

    await browser.close();
    return { success: true, message: `Login and ${action} successful` };

  } catch (err) {
    console.error(`❌ Error during ${action}:`, err.message);
    await browser.close();
    return { success: false, message: err.message };
  }
};

module.exports = {
  autoClockIn: () => loginAndClick("clockIn"),
  autoClockOut: () => loginAndClick("clockOut")
};

