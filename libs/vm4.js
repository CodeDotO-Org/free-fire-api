const https = require('follow-redirects').https;
const fs = require('fs');
const AdmZip = require('adm-zip');

const apiKey = '042d9c0fe57fb0f547289cdc267e79ef';
const pluginURL = 'https://antcpt.com/anticaptcha-plugin.zip';
let page = null;

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

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

async function freeFireApi4(app = '100067', item = '44111', userId = '97365784802') {
  const url = `https://shop.garena.my/?app=${app}&item=${item}&channel=202070`;

  // download the plugin
  await new Promise((resolve) => {
    https.get(pluginURL, (resp) =>
      resp.pipe(fs.createWriteStream('./plugin.zip').on('close', resolve))
    );
  });
  // unzip it
  const zip = new AdmZip('./plugin.zip');
  await zip.extractAllTo('./plugin/', true);

  // set API key in configuration file
  await new Promise((resolve, reject) => {
    if (fs.existsSync('./plugin/js/config_ac_api_key.js')) {
      let confData = fs.readFileSync('./plugin/js/config_ac_api_key.js', 'utf8');
      confData = confData.replace(
        /antiCapthaPredefinedApiKey = ''/g,
        `antiCapthaPredefinedApiKey = '${apiKey}'`
      );
      fs.writeFileSync('./plugin/js/config_ac_api_key.js', confData, 'utf8');
      resolve();
    } else {
      console.error('plugin configuration not found!');
      reject();
    }
  });

  // set browser launch options
  const options = {
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'],
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--allow-running-insecure-content',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--mute-audio',
      '--no-zygote',
      '--no-xshm',
      '--window-size=1920,1080',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--enable-webgl',
      '--ignore-certificate-errors',
      '--lang=en-US,en;q=0.9',
      '--password-store=basic',
      '--disable-gpu-sandbox',
      '--disable-software-rasterizer',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-infobars',
      '--disable-breakpad',
      '--disable-canvas-aa',
      '--disable-2d-canvas-clip-aa',
      '--disable-gl-drawing-for-tests',
      '--enable-low-end-device-mode',
      '--disable-extensions-except=./plugin',
      '--load-extension=./plugin',
    ],
  };

  try {
    // launch browser with the plugin
    const browser = await puppeteer.launch(options);
    page = await browser.newPage();
  } catch (e) {
    console.log('could not launch browser: ' + e.toString());
    return;
  }

  // navigate to the target page
  try {
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });
  } catch (e) {
    console.error('err while loading the page: ' + e);
  }

  // disable navigation timeout errors
  await page.setDefaultNavigationTimeout(0);

  await delay(2000);

  const okButtonClicked = await clickButtonByText(page, 'OK');
  if (!okButtonClicked) console.log('OK button not found.');

  await delay(2000);

  // fill the form
  await page.$eval(
    'input[placeholder="Please enter player ID here"]',
    (element, userId) => {
      element.value = userId;
    },
    login
  );

  // wait for "solved" selector to come up
  await page
    .waitForSelector('.antigate_solver.solved')
    .catch((error) => console.log('failed to wait for the selector'));

  // press the submit button
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
  ]);
  console.log('recaptcha solved');
}

module.exports = { freeFireApi4 };
