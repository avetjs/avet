const path = require('path');

module.exports = Loader => {
  class AvetLoader extends Loader {
    constructor(options) {
      super(options);

      this._init();
    }

    loadPlugin() {
      this.loadPlugin();
    }

    load() {
      this.loadAvetExtend();
      super.load();
    }

    _init() {
      // 兼容框架的 lib/core 目录
      const eggPaths = [];
      for (const eggPath of this.eggPaths) {
        eggPaths.push(eggPath);
        eggPaths.push(path.join(eggPath, 'lib/core'));
      }
      this.eggPaths = eggPaths;
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
          });
        }
      }

      for (const avetPath of this.avetPaths) {
        dirs.push({
          path: avetPath,
          type: 'framework',
        });
      }

      dirs.push({
        path: path.join(this.options.baseDir),
        type: 'app',
      });

      return dirs;
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
