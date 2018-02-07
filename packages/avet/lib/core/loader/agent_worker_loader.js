const { AgentWorkerLoader } = require('../egg');
const createLoader = require('./create_loader');

class AvetAgentWorkerLoader extends createLoader(AgentWorkerLoader) {
  /**
   * loadPlugin first, then loadConfig
   */
  loadConfig() {
    this.loadPlugin();
    super.loadConfig();
  }

  load() {
    if (process.env.AVET_RUN_ENV !== 'build') {
      this.loadAgentExtend();
      this.loadCustomAgent();
    }

    // avet layout
    this.loadLayout();
  }
}

module.exports = AvetAgentWorkerLoader;
