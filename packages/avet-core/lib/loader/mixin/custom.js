const path = require('path');

module.exports = {
  /**
   * load app.js
   *
   * ```
   */
  loadCustomApp() {
    this.getLoadUnits().forEach(unit =>
      this.loadFile(path.join(unit.path, 'app.js'))
    );
  },

  loadCustomAgent() {
    this.getLoadUnits()
      .forEach(unit => this.loadFile(path.join(unit.path, 'agent.js')));
  },
};
