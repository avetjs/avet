exports.getAverConfiguration = app => {
  return {
    baseDir: app.baseDir,
    appConfig: app.config.app,
    buildConfig: app.config.build,
    layouts: app.layouts,
    plugins: app.plugins,
  };
};
