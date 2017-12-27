const path = require('path');
const AgentWorkerLoader = require('./loader/agent_worker_loader');
const AvetApplication = require('./core/avet');

const EGG_LOADER = Symbol.for('egg#loader');
const EGG_PATH = Symbol.for('egg#eggPath');

class Agent extends AvetApplication {
  constructor(options = {}) {
    super(options);
  }

  get [EGG_LOADER]() {
    return AgentWorkerLoader;
  }

  get [EGG_PATH]() {
    return path.join(__dirname, '..');
  }
}

module.exports = Agent;
