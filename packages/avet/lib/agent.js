const path = require('path');
const { AvetCore } = require('avet-core');
const Messenger = require('./core/messenger');

const AVET_PATH = Symbol.for('avet#avetPath');

class Agent extends AvetCore {
  constructor(options = {}) {
    super(options);

    this.loader.loadPlugin();
    this.loader.loadConfig();
    this.loader.loadCustomAgent();
    this.loader.loadExtend();
  }

  get [AVET_PATH]() {
    return path.join(__dirname, '..');
  }
}

module.exports = Agent;
