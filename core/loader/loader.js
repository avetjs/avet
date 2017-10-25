'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const isFunction = require('is-type-of').function;
const debug = require('debug')('avet-loader');
const homedir = require('node-homedir');
const utils = require('./utils');

const AVET_PATH = Symbol.for('avet#avetPath');

class Loader {
  constructor(options) {
    this.options = options;
    this.app = this.options.app;

    this.pkg = require(path.join(this.options.baseDir, 'package.json'));
    this.avetPaths = this.getAvetPaths();
    debug('Loaded avetPaths %j', this.avetPaths);
    this.env = this.getEnv();
    debug('Loaded env %j', this.env);

    this.appInfo = this.getAppInfo();
  }

  getEnv() {
    let env;

    const envPath = path.join(this.options.baseDir, 'config/env');
    if (fs.existsSync(envPath)) {
      env = fs.readFileSync(envPath, 'utf8').trim();
    }

    if (!env) {
      env = process.env.AVET_ENV;
    }

    if (!env) {
      if (process.env.NODE_ENV === 'test') {
        env = 'unittest'
      } else if (process.env.NODE_ENV === 'production') {
        env = 'prod'
      } else {
        env = 'local'
      }
    }

    return env
  }

  getAppname() {
    if (this.pkg.name) {
      return this.pkg.name
    }
    const pkg = path.join(this.options.baseDir, 'package.json');
    throw new Error(`name is required from ${pkg}`);
  }

  getHomedir() {
    return process.env.AVET_HOME || homedir() || '/home/admin';
  }

  getAppInfo() {
    const env = this.env;
    const home = this.getHomedir();
    const baseDir = this.options.baseDir;

    return {
      name: this.getAppname(),
      baseDir,
      env,
      pkg: this.pkg,
      root: env === 'local' || env === 'unittest' ? baseDir : home,
    };
  }

  getAvetPaths() {
    const AvetCore = require('../avet')
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

  loadFile(filepath, ...inject) {
    if (!fs.existsSync(filepath)) {
      return null;
    }
    const ret = utils.loadFile(filepath);
    if (inject.length === 0) inject = [ this.app ];
    return isFunction(ret) ? ret(...inject) : ret;
  }

  getModuleRelativePath(modulePath) {
    assert(modulePath, 'modulePath required!');
    return path.relative(this.options.baseDir, modulePath).replace('node_modules/', '');
  }

  getLoadUnits() {
    if (this.dirs) {
      return this.dirs;
    }
    const dirs = this.dirs = [];

    if (this.orderPlugins) {
      for (const plugin of this.orderPlugins) {
        dirs.push({
          packageName: plugin.package,
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
      path: this.options.baseDir,
      type: 'app',
    });

    return dirs;
  }
}

const loaders = [
  require('./mixin/plugin').default,
  require('./mixin/config').default,
  require('./mixin/custom').default,
  require('./mixin/extend').default
]

for (const loader of loaders) {
  Object.assign(Loader.prototype, loader);
}

export default Loader;