const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  const pages = await browser.pages();
  const page = pages[0];
  await page.goto('https://app.omie.com.br/login/?redirect_to=https://portal.omie.com.br/meus-aplicativos');
  await page.click('#email');
  await page.type('#email', 'rpa@avonale.com.br');
  await page.click('#btn-continue');
  // await browser.close();
}

run();