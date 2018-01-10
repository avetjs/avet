/* global browser */

const timeout = 10000;

describe('puppeteer', () => {
  let page;

  beforeAll(async () => {
    page = await browser.newPage();
    await page.goto('https://www.baidu.com/');
  }, timeout);

  it('should load without error', async () => {
    const text = await page.evaluate(() => document.body.textContent);
    expect(text).toContain('baidu');
  });
});
