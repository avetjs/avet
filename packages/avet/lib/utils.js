exports.getAverConfiguration = app => {
  const appConfig = app.config.app;
  return {
    dir: appConfig.dir,
    appConfig,
    buildConfig: app.config.build,
    layouts: app.layouts,
    plugins: app.plugins,
  };
};
