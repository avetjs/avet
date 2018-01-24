const path = require('path');
const EggAgent = require('./core/egg').Agent;
const AgentWorkerLoader = require('./core/loader/agent_worker_loader');
const { getAverConfiguration } = require('./utils');

const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

class AvetAgent extends EggAgent {
  constructor(...opts) {
    super(...opts);

    // don't run in build env
    if (this.config.env === 'local') {
      const config = getAverConfiguration(this);
      const AvetBuildServer = require('avet-build/lib/server');
      this.avetBuildServer = new AvetBuildServer(this, config);
    }
  }

  get layouts() {
    return this.loader ? this.loader.layouts : {};
  }

  get avetPluginConfig() {
    return this.loader ? this.loader.avetPluginConfig : {};
  }

  get [EGG_LOADER]() {
    return AgentWorkerLoader;
  }

  get [EGG_PATH]() {
    return path.join(__dirname, '..');
  }
}

module.exports = AvetAgent;
