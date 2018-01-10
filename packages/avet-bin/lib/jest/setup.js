const fs = require('fs');
const path = require('path');
const os = require('os');

const Enzyme = require('enzyme');
const puppeteer = require('puppeteer');
const mkdirp = require('mkdirp');
const Adapter = require('enzyme-adapter-react-16');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

Enzyme.configure({ adapter: new Adapter() });

global.requestAnimationFrame =
  global.requestAnimationFrame ||
  function(cb) {
    return setTimeout(cb, 0);
  };

global.puppeteer = puppeteer;

module.exports = async function() {
  const browser = await puppeteer.launch();
  // store the browser instance so we can teardown it later
  global.browser = browser;

  // file the wsEndpoint for TestEnvironments
  mkdirp.sync(DIR);
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint());
};
