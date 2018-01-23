const path = require('path');
const EggApplication = require('./core/egg').Application;
const AppWorkerLoader = require('./core/loader/app_worker_loader');
const { getAverConfiguration } = require('./utils');

const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');
// const EGG_READY_TIMEOUT_ENV = Symbol('EggCore#eggReadyTimeoutEnv');

class Application extends EggApplication {
  constructor(...opts) {
    super(...opts);
    // this[EGG_READY_TIMEOUT_ENV] = Number.parseInt(
    //   process.env.EGG_READY_TIMEOUT_ENV || 20000,
    //   10
    // );

    // don't run in build env
    if (process.env.AVET_RUN_ENV !== 'build') {
      const config = getAverConfiguration(this);
      const AvetServer = require('avet-server/lib/server');
      this.avetServer = new AvetServer(config);
    }
  }

  get layouts() {
    return this.loader ? this.loader.layouts : {};
  }

  get avetPluginConfig() {
    return this.loader ? this.loader.avetPluginConfig : {};
  }

  get [EGG_LOADER]() {
    return AppWorkerLoader;
  }

  get [EGG_PATH]() {
    return path.join(__dirname, '..');
  }
}

module.exports = Application;
