const path = require('path');
const moduleAlias = require('module-alias');
const EggApplication = require('./core/egg').Application;
const AppWorkerLoader = require('./core/loader/app_worker_loader');
const { getAverConfiguration } = require('./utils');
const AvetServer = require('avet-server/lib/server');

const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

class Application extends EggApplication {
  constructor(...opts) {
    super(...opts);

    // Create aliases of directories and register custom module paths
    this.addAlias = moduleAlias.addAlias;
    this.addAliases = moduleAlias.addAliases;
    this.addPath = moduleAlias.addPath;

    const config = getAverConfiguration(this);
    this.avetServer = new AvetServer(config);
    this.beforeStart(async () => {
      // check env is local and need prepare ready
      if (this.env === 'local') {
        await this.avetServer.prepare();
      }
    });
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
