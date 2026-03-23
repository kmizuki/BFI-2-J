"use strict";
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:5173/BFI-2-J/");

  // Click start
  await page.click("button");

  // Answer all questions
  for (let i = 0; i < 60; i++) {
    await page.waitForSelector('input[type="radio"]');
    const radios = await page.$$('input[type="radio"]');
    await radios[2].click();
    await new Promise((r) => setTimeout(r, 400)); // wait for auto-advance
  }

  // Wait for result screen
  await page.waitForSelector("button");

  // Click download
  const buttons = await page.$$("button");
  for (const btn of buttons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text === "画像を保存") {
      await btn.click();
      break;
    }
  }

  await new Promise((r) => setTimeout(r, 2000)); // wait for download

  await browser.close();
})();
