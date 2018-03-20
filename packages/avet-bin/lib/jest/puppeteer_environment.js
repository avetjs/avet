const NodeEnvironment = require('jest-environment-node');
const fs = require('fs');
const os = require('os');
const path = require('path');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

const handleError = error => {
  process.emit('uncaughtException', error);
};

class PuppeteerEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();

    const wsEndpoint = fs.readFileSync(path.join(DIR, 'wsEndpoint'), 'utf8');
    if (!wsEndpoint) {
      throw new Error('wsEndpoint not found');
    }

    let puppeteer;
    try {
      puppeteer = require('puppeteer');

      this.global.browser = await puppeteer.connect({
        browserWSEndpoint: wsEndpoint,
      });
      this.global.page = await this.global.browser.newPage();
      this.global.page.addListener('pageerror', handleError);
    } catch (err) {
      console.warn('You should need to install puppeteer.');
    }
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = PuppeteerEnvironment;
