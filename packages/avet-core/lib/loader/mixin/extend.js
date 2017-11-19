const { existsSync } = require('fs');
const path = require('path');

module.exports = {
  /**
   * load extend info
   *
   * ```
   */
  loadExtend() {
    const ret = {
      mixin: [],
      layout: [],
    };

    for (const unit of this.getLoadUnits()) {
      if (unit.type === 'plugin') {
        const files = this._findExtendFiles(unit);

        if (!files) {
          continue;
        }

        if (files.mixin) ret.mixin.push(files.mixin);
        if (files.layout) ret.layout.push(files.layout);
      }
    }

    this.extends = ret;
  },

  _findExtendFiles(unit) {
    const ret = {};

    const mixinPath = path.join(unit.path, 'dist/extend/mixin.js');
    const mixinModulePath = path.join(unit.modulePath, 'dist/extend/mixin.js');

    if (existsSync(mixinPath)) {
      ret.mixin = {
        packageName: unit.packageName,
        path: mixinPath,
        relativePath: this.getModuleRelativePath(mixinModulePath),
      };
    }

    const layoutPath = path.join(unit.path, 'dist/extend/layout.cjs.js');
    const layoutModulePath = path.join(
      unit.modulePath,
      'dist/extend/layout.cjs.js'
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
