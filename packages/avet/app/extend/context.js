const AvetServer = require('avet-server/lib/server');
const { getAverConfiguration } = require('../../lib/utils');

const AVET_SERVER = Symbol('Context#avetServer');

module.exports = {
  get avetServer() {
    if (!this[AVET_SERVER]) {
      const config = getAverConfiguration(this);
      this[AVET_SERVER] = new AvetServer(config);
    }

    return this[AVET_SERVER];
  },
};
