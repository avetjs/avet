const { existsSync } = require('fs');
const path = require('path');

module.exports = {
  /**
   * load extend info
   *
   * ```
   */
  loadLayout() {
    const ret = {
      layout: [],
    };

    for (const unit of this.getLoadUnits()) {
      if (unit.type === 'plugin') {
        const layoutFiles = this._findLayoutFiles(unit);

        if (!layoutFiles) {
          continue;
        } else {
          ret.layout.push(layoutFiles);
        }
      }
    }

    this.layouts = ret.layout;
  },

  _findLayoutFiles(unit) {
    const layoutPath = path.join(unit.path, 'output/extend/layout.cjs.js');
    const layoutModulePath = path.join(
      unit.modulePath,
      'output/extend/layout.cjs.js'
    );

    if (existsSync(layoutPath)) {
      return {
        packageName: unit.packageName,
        path: layoutPath,
        relativePath: this.getModuleRelativePath(layoutModulePath),
      };
    }

    return null;
  },
};
