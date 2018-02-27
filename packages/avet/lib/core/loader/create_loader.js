const path = require('path');
const moduleAlias = require('module-alias');
const aliasModules = require('avet-build/lib/alias-modules');

module.exports = Loader => {
  class AvetLoader extends Loader {
    loadAlias() {
      moduleAlias.addAliases(aliasModules);
    }

    loadPlugin() {
      this.loadPlugin();
    }

    getLoadUnits() {
      if (this.dirs) {
        return this.dirs;
      }
      this.dirs = [];
      const { dirs } = this;

      if (this.orderPlugins) {
        for (const plugin of this.orderPlugins) {
          dirs.push({
            packageName: plugin.name,
            path: plugin.path,
            modulePath: plugin.modulePath,
            type: 'plugin',
            isAvetPlugin: plugin.isAvetPlugin,
          });
        }
      }

      for (const eggPath of this.eggPaths) {
        dirs.push({
          path: eggPath,
          type: 'framework',
        });
      }

      dirs.push({
        path: path.join(this.options.baseDir),
        type: 'app',
      });

      return dirs;
    }

    getModuleRelativePath(modulePath) {
      return path
        .relative(this.options.baseDir, modulePath)
        .replace('node_modules/', '');
    }
  }

  const mixins = [
    require('./mixin/config'),
    require('./mixin/layout'),
    require('./mixin/plugin'),
  ];

  for (const mixin of mixins) {
    Object.assign(AvetLoader.prototype, mixin);
  }

  return AvetLoader;
};
