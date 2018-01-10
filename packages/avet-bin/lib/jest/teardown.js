const rimraf = require('rimraf');
const os = require('os');
const path = require('path');

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup');

module.exports = async function() {
  await global.browser.close();
  rimraf.sync(DIR);
  process.exit(0);
};
