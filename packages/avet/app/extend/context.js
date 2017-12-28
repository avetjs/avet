const AVET_SERVER = Symbol('Context#avetServer');

module.exports = {
  get avetServer() {
    if (!this[AVET_SERVER]) {
      this[AVET_SERVER] = this.app.avetServer;
    }

    return this[AVET_SERVER];
  },
};
