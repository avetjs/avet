const assert = require('assert');

const extend = require('extend2');
const debug = require('debug')('avet-core:config');

module.exports = {
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
        babel: { plugins: [] },
        webpack: {},
        _webpackFnList: [],
        webpackDevMiddleware: {},
        _webpackDevMiddlewareFnList: [],
        webpackHotMiddleware: {},
        _webpackHotMiddlewareFnList: [],
      },
    };

    const avetPluginConfig = {};

    const _babelFnList = [];

    // Load Application config first
    const appConfig = this._preloadAppConfig();

    //   plugin config.default
    //     framework config.default
    //       app config.default
    //         plugin config.{env}
    //           framework config.{env}
    //             app config.{env}
    for (const filename of this.getTypeFiles('config')) {
      for (const unit of this.getLoadUnits()) {
        const isApp = unit.type === 'app';
        const config = this._loadConfig(
          unit.path,
          filename,
          isApp ? undefined : appConfig,
          unit.type
        );

        if (!config) {
          continue;
        }

        // 构建相关的处理
        if (config.build) {
          const { build } = config;

          if (typeof build.webpack === 'function') {
            target.build._webpackFnList.push(build.webpack);
            delete config.build.webpack;
          }

          if (typeof build.webpackDevMiddleware === 'function') {
            target.build._webpackDevMiddlewareFnList.push(
              build.webpackDevMiddleware
            );
            delete config.build.webpackDevMiddleware;
          }

          if (typeof build.webpackHotMiddleware === 'function') {
            target.build._webpackHotMiddlewareFnList.push(
              build.webpackHotMiddleware
            );
            delete config.build.webpackHotMiddleware;
          }

          if (typeof config.build.babel === 'function') {
            _babelFnList.push(config.build.babel);
            delete config.build.babel;
          }
        }

        debug('Loaded config %s/%s, %j', unit.path, filename, config);

        if (
          unit.isAvetPlugin ||
          Object.keys(avetPluginConfig).some(v => !!config[v])
        ) {
          extend(true, avetPluginConfig, config);
        }

        extend(true, target, config);
      }
    }

    _babelFnList.forEach(fn => {
      const babelConfig = fn(target.build.babel, target);

      assert(babelConfig, 'babel funtion need return babelConfig object');

      target.build.babel = babelConfig;
    });

    // You can manipulate the order of app.config.coreMiddleware and app.config.appMiddleware in app.js
    target.coreMiddleware = target.coreMiddlewares =
      target.coreMiddleware || [];
    target.appMiddleware = target.appMiddlewares = target.middleware || [];

    this.config = target;
    this.avetPluginConfig = avetPluginConfig;
  },
};
