const AvetLoader = require('avet-core').EggLoader;

class AgentWorkerLoader extends AvetLoader {
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
    this.loadAvetExtend();
  }
}

module.exports = AgentWorkerLoader;
