exports.getAverConfiguration = app => {
  const appConfig = app.config.app;
  return {
    dir: appConfig.dir,
    dev: appConfig.dev,
    config: app.config,
    appConfig,
    avetPluginConfig: app.avetPluginConfig,
    buildConfig: app.config.build,
    layouts: app.layouts,
    plugins: app.plugins,
  };
};
