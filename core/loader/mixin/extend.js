import * as path from 'path';
import * as fs from 'fs';

export default {
  /**
   * load extend info
   *
   * ```
   */
  loadExtend() {
    const ret = {
      mixin: []
    }

    for (const unit of this.getLoadUnits()) {
      if (unit.type === 'plugin') {
        const files = this._findExtendFiles(unit);

        if (!files) {
          continue;
        }

        if (files.mixin) ret.mixin.push(files.mixin);
      }
    }

    this.extends = ret;
  },

  _findExtendFiles(unit) {
    let mixinPath = path.join(unit.path, 'dist/extend/mixin.js');
    let mixinModulePath = path.join(unit.modulePath, 'dist/extend/mixin.js');

    if (!mixinPath || !fs.existsSync(mixinPath)) return null;
    return {
      mixin: {
        packageName: unit.packageName,
        path: mixinPath,
        relativePath: this.getModuleRelativePath(mixinModulePath),
      }
    }
  }
}