const path = require('path');
const { AvetCore } = require('avet-core');

const AVET_PATH = Symbol.for('avet#avetPath');

class Application extends AvetCore {
  constructor(options) {
    options.type = 'application';

    super(options);

    this.loader.loadPlugin();
    this.loader.loadConfig();
    this.loader.loadCustomApp();
    this.loader.loadAvetExtend();
  }

  get [AVET_PATH]() {
    return path.join(__dirname, '..');
  }
}

module.exports = Application;
