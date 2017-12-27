const path = require('path');
const { AvetCore } = require('avet-core');
const { AgentWorkerLoader } = require('./loader');

const AVET_PATH = Symbol.for('avet#avetPath');
const EGG_LOADER = Symbol.for('egg#loader');

class Agent extends AvetCore {
  constructor(options = {}) {
    super(options);

    this.loader.loadPlugin();
    this.loader.loadConfig();
    this.loader.loadCustomAgent();
    this.loader.loadExtend();
  }

  get [EGG_LOADER]() {
    return AgentWorkerLoader;
  }

  get [AVET_PATH]() {
    return path.join(__dirname, '..');
  }
}

module.exports = Agent;
