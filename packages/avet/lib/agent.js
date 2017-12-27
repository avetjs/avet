const path = require('path');
const { AgentWorkerLoader } = require('./loader');

const AVET_PATH = Symbol.for('avet#avetPath');
const AVET_LOADER = Symbol.for('avet#loader');

class Agent extends AgentWorkerLoader {
  constructor(options = {}) {
    super(options);
  }

  get [AVET_LOADER]() {
    return AgentWorkerLoader;
  }

  get [AVET_PATH]() {
    return path.join(__dirname, '..');
  }
}

module.exports = Agent;
