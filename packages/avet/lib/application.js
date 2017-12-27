const path = require('path');
const moduleAlias = require('module-alias');
const EggApplication = require('./core/egg').Application;
const AppWorkerLoader = require('./core/loader/app_worker_loader');

const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

class Application extends EggApplication {
  constructor(options) {
    super(options);

    // Create aliases of directories and register custom module paths
    this.addAlias = moduleAlias.addAlias;
    this.addAliases = moduleAlias.addAliases;
    this.addPath = moduleAlias.addPath;
  }

  get layouts() {
    return this.loader ? this.loader.layouts : {};
  }

  get [EGG_LOADER]() {
    return AppWorkerLoader;
  }

  get [EGG_PATH]() {
    return path.join(__dirname, '..');
  }
}

module.exports = Application;
