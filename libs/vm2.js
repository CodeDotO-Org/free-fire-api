const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const { generateHOTP } = require('./garena'); // Ensure this is implemented correctly
const { garenaAcc } = require('../utilities/dev'); // Ensure credentials are correct

// Configure Puppeteer with plugins
puppeteer.use(StealthPlugin());
// puppeteer.use(
//   RecaptchaPlugin({
//     provider: {
//       id: '2captcha',
//       token: '3b36f1051de5ba74781c5522be886e8b', // Replace with your actual 2Captcha API key
//     },
//     visualFeedback: true, // Enables visual feedback for reCAPTCHA handling
//   })
// );

async function clearSpecificCookie(page, cookieName) {
  const cookies = await page.cookies();
  const cookieToDelete = cookies.find((cookie) => cookie.name === cookieName);

  if (cookieToDelete) {
    await page.deleteCookie(cookieToDelete);
    page.re;
    console.log(`Cookie "${cookieName}" cleared.`);
  } else {
    console.log(`Cookie "${cookieName}" not found.`);
  }
}

// Helper function for delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to click a button by its text
const clickButtonByText = async (page, text) => {
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const buttonText = await page.evaluate((btn) => btn.textContent.trim(), button);
    if (buttonText === text) {
      await button.click();
      return true;
    }
  }
  return false;
};

// Main function
// https://shop.garena.my/?app=100067&item=44111&channel=202070
async function freeFireApi2(app = '100067', item = '44111', userId = '9736578480') {
  const browserURL = 'http://127.0.0.1:9222'; // Remote debugging URL

  let browser;
  let page;

  try {
    // Launch Puppeteer with stealth settings
    browser = await puppeteer.connect({ browserURL });
    // browser = await puppeteer.launch({
    //   headless: false, // Set to true for headless mode
    //   executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // Replace with actual Chrome path if required
    //   args: [
    //     '--no-sandbox',
    //     '--disable-setuid-sandbox',
    //     '--disable-blink-features=AutomationControlled',
    //     '--start-maximized',
    //   ],
    //   defaultViewport: null,
    // });

    page = await browser.newPage();

    // Set user agent and headers
    // await page.setUserAgent(
    //   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
    // );
    // await page.setExtraHTTPHeaders({
    //   'Accept-Language': 'en-US,en;q=0.9',
    // });

    // Navigate to the target URL
    const url = `https://shop.garena.my/?app=${app}&item=${item}&channel=202070`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Clear the specific cookie by name
    await clearSpecificCookie(page, 'session_key');

    await delay(2000);

    // Handle cookies if needed
    const cookies = await page.cookies();
    const sessionCookie = cookies.find((cookie) => cookie.name === 'session_key');
    if (sessionCookie) {
      await page.setCookie(...cookies.filter((cookie) => cookie.name !== 'session_key'));
      console.log('Session cookie cleared.');
    }

    // Handle OK button
    const okButtonClicked = await clickButtonByText(page, 'OK');
    if (!okButtonClicked) console.log('OK button not found.');

    // Fill user ID
    const loginInputSelector = 'input[placeholder="Please enter player ID here"]';
    await page.waitForSelector(loginInputSelector, { timeout: 5000 });
    await page.type(loginInputSelector, userId, { delay: 100 });
    console.log('User ID entered successfully.');

    // Click "Login" button
    await clickButtonByText(page, 'Login');
    console.log('Login button clicked.');

    // await delay(3000);

    // const { solved, error } = await page.solveRecaptchas();
    // if (solved) {
    //   console.log('CAPTCHA solved successfully.');
    // } else {
    //   console.error('CAPTCHA solving failed:', error);
    // }

    await delay(1000);

    await clickButtonByText(page, 'Buy Now');
    console.log('Buy now button clicked.');

    await delay(1000);

    await clickButtonByText(page, 'Login');
    console.log('Login button clicked.');

    await delay(5000);

    // Enter credentials
    // const usernameInputSelector = 'input[placeholder="Garena Username, Email or Phone"]';
    // const passwordInputSelector = 'input[placeholder="Password"]';
    // await page.waitForSelector(usernameInputSelector, { timeout: 5000 });
    // await page.type(usernameInputSelector, garenaAcc.username);
    // await page.type(passwordInputSelector, garenaAcc.password);
    // console.log('Credentials entered.');

    // // Submit login form
    // const submitButtonSelector = 'button.primary[type="submit"]';
    // await page.click(submitButtonSelector);
    // console.log('Login form submitted.');

    const userInputSelector = 'input[placeholder="Garena Username, Email or Phone"]';
    const userInputExists = await page.$(userInputSelector);

    if (userInputExists) {
      // Focus on the OTP input field
      await page.focus(userInputSelector);

      // Simulate typing the OTP into the field
      await page.type(userInputSelector, garenaAcc.username);
      console.log('Username typed successfully.');
    } else {
      console.log('Username input field not found.');
    }

    await delay(2000);

    const passInputSelector = 'input[placeholder="Password"]';
    const passInputExists = await page.$(passInputSelector);

    if (passInputExists) {
      // Focus on the OTP input field
      await page.focus(passInputSelector);

      // Simulate typing the OTP into the field
      await page.type(passInputSelector, garenaAcc.password);
      console.log('Password typed successfully.');
    } else {
      console.log('Password input field not found.');
    }

    const submitInputSelector = 'button.primary[type="submit"]';
    const submitInputExists = await page.$(submitInputSelector);

    if (submitInputExists) {
      await page.click(submitInputSelector);

      console.log('Login typed successfully.');
    } else {
      console.log('Login input field not found.');
    }

    await delay(2000);

    // Handle OTP if required
    const otpInputSelector = '[name="ssoOtpCode"]';
    if (await page.$(otpInputSelector)) {
      const otpCode = generateHOTP(); // Generate OTP
      await page.type(otpInputSelector, otpCode, { delay: 100 });
      console.log('OTP entered.');

      // Confirm OTP
      await clickButtonByText(page, 'Confirm');
      console.log('OTP confirmed.');
    }

    await delay(2000);

    // Extract Transaction ID
    const transactionId = await page.evaluate(() => {
      const transactionElement = document.querySelector('.text-sm\\/\\[22px\\]');
      return transactionElement ? transactionElement.textContent.split('ID')[1].trim() : null;
    });

    console.log(`Transaction ID: ${transactionId}`);
    return transactionId;
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (page) await page.close();
  }
}

module.exports = { freeFireApi2 };
