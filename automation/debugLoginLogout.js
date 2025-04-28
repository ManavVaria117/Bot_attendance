const puppeteer = require('puppeteer');

const automateLoginLogout = async (mode) => {
  const browser = await puppeteer.launch({ headless: false }); // Open the browser in non-headless mode for debugging
  const page = await browser.newPage();

  // Go to the page where login and logout buttons exist
  console.log('Navigating to the page...');
  await page.goto('https://bureauveritas.onelogin.com/login2/?return=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwYXJhbXMiOnt9LCJtZXRob2QiOiJnZXQiLCJmZl9tdWx0aXBsZV9icmFuZHMiOnRydWUsIm5vdGlmaWNhdGlvbiI6eyJ0eXBlIjoiaW5mbyIsIm1lc3NhZ2UiOiJDb25uZWN0aW5nIHRvICoqQWxsU2VjaHJvIFVzZXIqKiIsInZhbHVlcyI6WyIqKkFsbFNlY2hybyBVc2VyKioiXSwidGVtcGxhdGVfaWQiOiJjb25uZWN0aW5nX3RvX2FwcCIsImljb24iOiJjb25uZWN0aW9uIn0sImJyYW5kX2lkIjoibWFzdGVyIiwidXJpIjoiaHR0cHM6Ly9idXJlYXV2ZXJpdGFzLm9uZWxvZ2luLmNvbS90cnVzdC9zYW1sMi9odHRwLXBvc3Qvc3NvLzA2NTM2NzhiLTBmMjUtNDhjYi1iNzM0LTQ1OGEwNWFjNzgxYj9zYW1sX3JlcXVlc3RfcGFyYW1zX3Rva2VuPWRkZGY5ZTcwNWYuZTljMzQ5ZjhjZDJjMTgyNmI0NmFlMDI4YmY4NmRlNjI3ZTFjZDc0My41YjRmMlNIUXJIQTNpcDEtOVRVMXJXS2ZDOEdhckxmQlRha1JWODNWYTBBJTNEIiwiaXNzIjoiTU9OT1JBSUwiLCJhdWQiOiJBQ0NFU1MiLCJhcHBfaWQiOiIwNjUzNjc4Yi0wZjI1LTQ4Y2ItYjczNC00NThhMDVhYzc4MWIiLCJleHAiOjE3NDU0NjYzNTR9.DvQoVcjXbq4QnV1GHfZBQf-E9EcNl2bU3B3ONbWI0uw#app=0653678b-0f25-48cb-b734-458a05ac781b');  // Replace with your actual URL
  console.log('Page loaded.');

  // Debugging: Print the current page URL
  console.log('Current Page URL:', page.url());

  // Wait for the login button to appear and click it if mode is 'login'
  if (mode === 'login') {
    console.log('Waiting for the login button...');
    try {
      await page.waitForSelector('.sc-kPVwWT.duNpUs.sc-kpOJdX.duZYCT', { timeout: 5000 });  // Adjust selector to match your login button
      console.log('Login button found. Clicking...');
      await page.click('.sc-kPVwWT.duNpUs.sc-kpOJdX.duZYCT');  // Simulate clicking the login button
      console.log('Login button clicked.');

      // Wait for page to load or navigate after login
      await page.waitForNavigation({ timeout: 10000 });  // Wait for navigation (adjust timeout as needed)
      console.log('Login successful, page navigated.');
    } catch (error) {
      console.error('Error during login button click:', error.message);
    }
  }


  // After the automation, log the page URL again for debugging
  console.log('After action, current page URL:', page.url());

  // Close the browser after the test is complete
  console.log('Closing the browser...');
  await browser.close();
};

// Test Login Button Click (Run this first to test login functionality)
automateLoginLogout('login');  // Replace 'login' with 'logout' for testing logout action

// Test Logout Button Click (Run this separately if needed)
// automateLoginLogout('logout'); // Uncomment this line to test the logout functionality
