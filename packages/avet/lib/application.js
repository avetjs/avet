const path = require('path');
const { AppWorkerLoader } = require('./loader');

const AVET_PATH = Symbol.for('avet#avetPath');
const AVET_LOADER = Symbol.for('avet#loader');

class Application extends AppWorkerLoader {
  constructor(options = {}) {
    super(options);
  }

  get [AVET_LOADER]() {
    return AppWorkerLoader;
  }

  get [AVET_PATH]() {
    return path.join(__dirname, '..');
  }
}

module.exports = Application;
