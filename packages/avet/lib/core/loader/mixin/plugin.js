const fs = require('fs');
const path = require('path');
// const { loadFile } = require('egg-core').utils;

const debug = require('debug')('avet-core:loader:plugin');

module.exports = {
  /**
   * Load config/plugin.js from {AvetLoader#loadUnits}
   *
   * plugin.js is written below
   *
   * ```js
   * {
   *   'xxx-client': {
   *     enable: true,
   *     package: 'xxx-client',
   *     dep: [],
   *     env: [],
   *   }
   * }
   * ```
   *
   * If the plugin has path, Loader will find the module from it.
   *
   * Otherwise Loader will lookup follow the order by packageName
   *
   * 1. $APP_BASE/node_modules/${package}
   * 2. $AVET_BASE/node_modules/${package}
   *
   * You can call `loader.plugins` that retrieve enabled plugins.
   *
   * ```js
   * loader.plugins['xxx-client'] = {
   *   name: 'xxx-client',                 // the plugin name, it can be used in `dep`
   *   package: 'xxx-client',              // the package name of plugin
   *   enable: true,                       // whether enabled
   *   path: 'path/to/xxx-client',         // the directory of the plugin package
   *   dep: [],                            // the dependent plugins, you can use the plugin name
   *   env: [ 'local', 'unittest' ],       // specify the serverEnv that only enable the plugin in it
   * }
   * ```
   *
   * `loader.allPlugins` can be used when retrieve all plugins.
   * @method AvetLoader#loadPlugin
   */
  loadPlugin() {
    // loader plugins from application
    const appPlugins = this.readPluginConfigs(
      path.join(this.options.baseDir, 'config/plugin.default.js')
    );
    debug('Loaded app plugins: %j', Object.keys(appPlugins));

    // loader plugins from framework
    const avetPluginConfigPaths = this.eggPaths.map(avetPath =>
      path.join(avetPath, 'config/plugin.default.js')
    );
    const avetPlugins = this.readPluginConfigs(avetPluginConfigPaths);
    debug('Loaded avet plugins: %j', Object.keys(avetPlugins));

    // loader plugins from process.env.AVET_PLUGINS
    let customPlugins;
    if (process.env.AVET_PLUGINS) {
      try {
        customPlugins = JSON.parse(process.env.AVET_PLUGINS);
      } catch (e) {
        debug('parse AVET_PLUGINS failed, %s', e);
      }
    }

    // loader plugins from options.plugins
    if (this.options.plugins) {
      customPlugins = Object.assign({}, customPlugins, this.options.plugins);
    }

    if (customPlugins) {
      for (const name in customPlugins) {
        this.normalizePluginConfig(customPlugins, name);
      }
      debug('Loaded custom plugins: %j', Object.keys(customPlugins));
    }

    this.allPlugins = {};
    this.appPlugins = appPlugins;
    this.customPlugins = customPlugins;
    this.avetPlugins = avetPlugins;

    this._extendPlugins(this.allPlugins, avetPlugins);
    this._extendPlugins(this.allPlugins, appPlugins);
    this._extendPlugins(this.allPlugins, customPlugins);

    const enabledPluginNames = []; // enabled plugins that configured explicitly
    const plugins = {};
    const { env } = this;
    for (const name in this.allPlugins) {
      const plugin = this.allPlugins[name];

      // resolve the real plugin.path based on plugin or package
      const pluginPath = this.getPluginPath(plugin, this.options.baseDir);
      plugin.path = pluginPath.path;
      plugin.modulePath = pluginPath.modulePath;

      // read plugin information from ${plugin.path}/package.json
      this.mergePluginConfig(plugin);

      // disable the plugin that not match the serverEnv
      if (env && plugin.env.length && plugin.env.indexOf(env) === -1) {
        debug('Disable %j, as env is %j but got %j', name, plugin.env, env);
        plugin.enable = false;
        continue;
      }

      // Can't enable the plugin implicitly when it's disabled by application
      if (appPlugins[name] && !appPlugins[name].enable) {
        debug('Disable %j, as disabled by app', name);
        continue;
      }

      plugins[name] = plugin;

      if (plugin.enable) {
        enabledPluginNames.push(name);
      }
    }

    // retrieve the ordered plugins
    this.orderPlugins = this.getOrderPlugins(plugins, enabledPluginNames);

    const enablePlugins = {};
    for (const plugin of this.orderPlugins) {
      enablePlugins[plugin.name] = plugin;
    }
    debug('Loaded plugins: %j', Object.keys(enablePlugins));

    /**
     * Retrieve enabled plugins
     * @member {Object} AvetLoader#plugins
     */
    this.plugins = enablePlugins;
  },

  // Read plugin information from package.json and merge
  // {
  //   avetPlugin: {
  //     "name": "",    plugin name, must be same as name in config/plugin.js
  //     "dep": [],     dependent plugins
  //     "env": ""      env
  //   }
  // }
  mergePluginConfig(plugin) {
    let pkg;
    let config;
    const pluginPackage = path.join(plugin.path, 'package.json');
    if (fs.existsSync(pluginPackage)) {
      pkg = require(pluginPackage);
      if (pkg.avetPlugin) {
        pkg.avetPlugin.isAvetPlugin = true;
        config = pkg.avetPlugin;
      } else {
        config = pkg.eggPlugin;
      }

      if (pkg.version) {
        plugin.version = pkg.version;
      }
    }

    if (!config) {
      console.warn(
        `[avet:loader] pkg.avetPlugin or pkg.eggPlugin is missing in ${pluginPackage}`
      );
      return;
    }

    if (config.name && config.name !== plugin.name) {
      // pluginName is configured in config/plugin.js
      // pluginConfigName is pkg.avetPath.name
      console.warn(
        `[avet:loader] pluginName(${
          plugin.name
        }) is different from pluginConfigName(${config.name})`
      );
    }

    // dep compatible
    depCompatible(config);

    for (const key of [ 'dependencies', 'optionalDependencies', 'env' ]) {
      if (!plugin[key].length && Array.isArray(config[key])) {
        plugin[key] = config[key];
      }
    }

    plugin.isAvetPlugin = config.isAvetPlugin;
  },

  // Get the real plugin path
  getPluginPath(plugin) {
    if (plugin.path && plugin.modulePath) {
      return {
        path: plugin.path,
        modulePath: plugin.modulePath,
      };
    }

    const name = plugin.package || plugin.name;
    const lookupDirs = [];

    // 尝试在以下目录找到匹配的插件
    //  -> {APP_PATH}/node_modules
    //    -> {AVET_PATH}/node_modules
    //      -> $CWD/node_modules
    lookupDirs.push(path.join(this.options.baseDir, 'node_modules'));

    // 到 avet 中查找，优先从外往里查找
    for (let i = this.eggPaths.length - 1; i >= 0; i--) {
      const avetPath = this.eggPaths[i];
      lookupDirs.push(path.join(avetPath, 'node_modules'));
    }

    // should find the $cwd/node_modules when test the plugins under npm3
    lookupDirs.push(path.join(process.cwd(), 'node_modules'));

    for (let dir of lookupDirs) {
      dir = path.join(dir, name);
      if (fs.existsSync(dir)) {
        return {
          path: fs.realpathSync(dir),
          modulePath: dir,
        };
      }
    }

    throw new Error(
      `Can not find plugin ${name} in "${lookupDirs.join(', ')}"`
    );
  },

  _extendPlugins(target, plugins) {
    if (!plugins) {
      return;
    }
    for (const name in plugins) {
      const plugin = plugins[name];
      let targetPlugin = target[name];
      if (!targetPlugin) {
        targetPlugin = target[name] = {};
      }
      if (targetPlugin.package && targetPlugin.package === plugin.package) {
        console.warn(
          'plugin %s has been defined that is %j, but you define again in %s',
          name,
          targetPlugin,
          plugin.from
        );
      }
      if (plugin.path || plugin.package) {
        delete targetPlugin.path;
        delete targetPlugin.package;
      }
      for (const prop in plugin) {
        if (plugin[prop] === undefined) {
          continue;
        }
        if (
          targetPlugin[prop] &&
          Array.isArray(plugin[prop]) &&
          !plugin[prop].length
        ) {
          continue;
        }
        targetPlugin[prop] = plugin[prop];
      }
    }
  },
};

function depCompatible(plugin) {
  if (
    plugin.dep &&
    !(Array.isArray(plugin.dependencies) && plugin.dependencies.length)
  ) {
    plugin.dependencies = plugin.dep;
    delete plugin.dep;
  }
}
