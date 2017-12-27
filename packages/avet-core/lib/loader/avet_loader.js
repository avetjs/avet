const fs = require('fs');
const path = require('path');
const debug = require('debug')('avet-loader');
const { EggLoader } = require('egg-core');

const AVET_PATH = Symbol.for('avet#avetPath');

class Loader extends EggLoader {
  constructor(options) {
    super(options);

    this.eggPaths = this.getEggPaths();
    debug('Loaded eggPaths %j', this.eggPaths);
  }

  getEggPaths() {
    const AvetCore = require('../avet');
    const avetPaths = [];

    let proto = this.app;

    while (proto) {
      proto = Object.getPrototypeOf(proto);
      if (proto === Object.prototype || proto === AvetCore.prototype) {
        break;
      }
      const avetPath = proto[AVET_PATH];

      if (!avetPath) {
        break;
      }

      const realpath = fs.realpathSync(avetPath);
      if (avetPaths.indexOf(realpath) === -1) {
        avetPaths.unshift(realpath);
      }
    }
    return avetPaths;
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

const loaders = [
  require('./mixin/plugin'),
  require('./mixin/config'),
  require('./mixin/extend'),
];

for (const loader of loaders) {
  Object.assign(Loader.prototype, loader);
}

module.exports = Loader;
