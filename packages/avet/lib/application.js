const path = require('path');
const { AppWorkerLoader } = require('./loader');

const AVET_PATH = Symbol.for('avet#avetPath');
const EGG_LOADER = Symbol.for('egg#loader');

class Application extends AppWorkerLoader {
  constructor(options) {
    super(options);

    this.loader.loadPlugin();
    this.loader.loadConfig();
    this.loader.loadCustomApp();
    this.loader.loadAvetExtend();
  }

  get [EGG_LOADER]() {
    return AppWorkerLoader;
  }

  get [AVET_PATH]() {
    return path.join(__dirname, '..');
  }
}

module.exports = Application;
