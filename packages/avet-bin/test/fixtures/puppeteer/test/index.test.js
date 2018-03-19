/* global browser */

const timeout = 20000;

describe(
  'puppeteer',
  () => {
    let page;

    beforeAll(async () => {
      page = await browser.newPage();
      await page.goto('https://github.com/');
    }, timeout);

    it('should load without error', async () => {
      const text = await page.evaluate(() => document.body.textContent);
      expect(text).toContain('github');
    });
  },
  timeout
);
