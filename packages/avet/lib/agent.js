const path = require('path');
const EggAgent = require('./core/egg').Agent;
const AgentWorkerLoader = require('./core/loader/agent_worker_loader');

const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

class AvetAgent extends EggAgent {
  get [EGG_LOADER]() {
    return AgentWorkerLoader;
  }

  get [EGG_PATH]() {
    return path.join(__dirname, '..');
  }
}

module.exports = AvetAgent;
