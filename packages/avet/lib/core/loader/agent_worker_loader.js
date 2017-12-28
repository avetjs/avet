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
    this.loadAgentExtend();
    this.loadCustomAgent();
  }
}

module.exports = AvetAgentWorkerLoader;
