const { existsSync } = require('fs');
const path = require('path');

module.exports = {
  /**
   * load extend info
   *
   * ```
   */
  loadAvetExtend() {
    const ret = {
      layout: [],
    };

    for (const unit of this.getLoadUnits()) {
      if (unit.type === 'plugin') {
        const files = this._findExtendFiles(unit);

        if (!files) {
          continue;
        }

        if (files.layout) ret.layout.push(files.layout);
      }
    }

    this.layouts = ret.layout;
  },

  _findExtendFiles(unit) {
    const ret = {};
    const layoutPath = path.join(unit.path, 'output/extend/layout.cjs.js');
    const layoutModulePath = path.join(
      unit.modulePath,
      'output/extend/layout.cjs.js'
    );

    if (existsSync(layoutPath)) {
      ret.layout = {
        packageName: unit.packageName,
        path: layoutPath,
        relativePath: this.getModuleRelativePath(layoutModulePath),
      };
    }

    return ret;
  },
};
