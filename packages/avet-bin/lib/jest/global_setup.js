const fs = require('fs');
const path = require('path');
const os = require('os');

const puppeteer = require('puppeteer');
const mkdirp = require('mkdirp');

const Enzyme = require('enzyme');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

module.exports = async function() {
  const browser = await puppeteer.launch();
  // store the browser instance so we can teardown it later
  global.browser = browser;
  global.puppeteer = puppeteer;

  // file the wsEndpoint for TestEnvironments
  mkdirp.sync(DIR);
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
};
