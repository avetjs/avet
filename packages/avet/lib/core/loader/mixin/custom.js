const path = require('path');

module.exports = {
  /**
   * load build.js
   *
   * @example
   * ```js
   * module.exports = function(app) {
   *   // can do everything
   *   do();
   * }
   * ```
   */
  loadCustomBuild() {
    this.getLoadUnits().forEach(unit =>
      this.loadFile(this.resolveModule(path.join(unit.path, 'build')))
    );
  },
};
