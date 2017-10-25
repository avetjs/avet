import * as path from 'path';

export default {
  /**
   * load app.js
   *
   * ```
   */
  loadCustomApp() {
    this.getLoadUnits()
      .forEach(unit => this.loadFile(path.join(unit.path, 'app.js')))
  }
}