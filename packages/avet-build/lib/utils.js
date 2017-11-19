const { join } = require('path');
const { existsSync } = require('fs');

function getPluginBabelAlias(plugins, entryname) {
  const names = Object.keys(plugins);
  const alias = {};
  let hasAlias = false;

  names.forEach(name => {
    const plugin = plugins[name];
    const modulePath = join(plugin.path, entryname);

    if (!existsSync(modulePath)) return;

    hasAlias = true;
    alias[`avet/${name}`] = require.resolve(modulePath);
  });

  if (hasAlias) {
    const babelConfig = [
      require.resolve('babel-plugin-module-resolver'),
      {
        alias,
      },
    ];

    return babelConfig;
  }

  return null;
}

function getPluginNodeBabelAlias(plugins) {
  return getPluginBabelAlias(plugins, 'index.umd.js');
}

function getPluginModuleBabelAlias(plugins) {
  return getPluginBabelAlias(plugins, 'index.cjs.js');
}

module.exports = {
  getPluginNodeBabelAlias,
  getPluginModuleBabelAlias,
};
