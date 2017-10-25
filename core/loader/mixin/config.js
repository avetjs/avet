import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';

const extend = require('extend2');
const debug = require('debug')('avet-core:config');

const SET_CONFIG_META = Symbol('Loader#setConfigMeta');

export default {

  /**
   * Load config/config.js
   *
   * Will merge config.default.js and config.${env}.js
   *
   * @method AvetLoader#loadConfig
   */
  loadConfig() {
    this.configMeta = {};

    const target = {
      // define webpack about
      build: {
        webpack: {},
        _webpackFnList: [],
        webpackDevMiddleware: {},
        _webpackDevMiddlewareFnList: [],
        webpackHotMiddleware: {},
        _webpackHotMiddlewareFnList: [],
      }
    };

    const names = [
      'config.default.js',
      `config.${this.env}.js`,
    ];

    // Load Application config first
    const appConfig = this._preloadAppConfig();

    //   plugin config.default
    //     framework config.default
    //       app config.default
    //         plugin config.{env}
    //           framework config.{env}
    //             app config.{env}
    for (const filename of names) {
      for (const unit of this.getLoadUnits()) {
        const isApp = unit.type === 'app';
        const config = this._loadConfig(unit.path, filename, isApp ? undefined : appConfig, unit.type);

        if (!config) {
          continue;
        }

        // 构建相关的处理
        if (config.build) {
          const build = config.build;

          if (typeof build.webpack === 'function') {
            target.build._webpackFnList.push(build.webpack)
            delete config.build.webpack
          }

          if (typeof build.webpackDevMiddleware === 'function') {
            target.build._webpackDevMiddlewareFnList.push(build.webpackDevMiddleware)
            delete config.build.webpackDevMiddleware
          }

          if (typeof build.webpackHotMiddleware === 'function') {
            target.build._webpackHotMiddlewareFnList.push(build.webpackHotMiddleware)
            delete config.build.webpackHotMiddleware
          }
        }

        debug('Loaded config %s/%s, %j', unit.path, filename, config);
        extend(true, target, config);
      }
    }
    this.config = target;
  },

  _preloadAppConfig() {
    const names = [
      'config.default.js',
      `config.${this.env}.js`,
    ];
    const target = {};
    for (const filename of names) {
      const config = this._loadConfig(this.options.baseDir, filename, undefined, 'app');
      extend(true, target, config);
    }
    return target;
  },

  _loadConfig(dirpath, filename, extraInject, type) {
    const isApp = type === 'app';

    let filepath = path.join(dirpath, 'config', filename);
    // let config.js compatible
    if (filename === 'config.default.js' && !fs.existsSync(filepath)) {
      filepath = path.join(dirpath, 'config/config.js');
    }

    const config = this.loadFile(filepath, this.appInfo, extraInject);
    if (!config) return null;

    // store config meta, check where is the property of config come from.
    this[SET_CONFIG_META](config, filepath);

    return config;
  },

  [SET_CONFIG_META](config, filepath) {
    config = extend(true, {}, config);
    setConfig(config, filepath);
    extend(true, this.configMeta, config);
  },
};

function setConfig(obj, filepath) {
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && Object.getPrototypeOf(val) === Object.prototype && Object.keys(val).length > 0) {
      setConfig(val, filepath);
      continue;
    }
    obj[key] = filepath;
  }
}