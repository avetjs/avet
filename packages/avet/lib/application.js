const path = require('path');
const AvetApplication = require('./core/avet');
const AppWorkerLoader = require('./loader/app_worker_loader');

const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

class Application extends AvetApplication {
  constructor(options = {}) {
    super(options);
  }

  get [EGG_LOADER]() {
    return AppWorkerLoader;
  }

  get [EGG_PATH]() {
    return path.join(__dirname, '..');
  }
}

module.exports = Application;
