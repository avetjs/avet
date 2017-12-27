exports.getAverConfiguration = ctx => {
  const { app } = ctx;

  return {
    baseDir: app.baseDir,
    appConfig: app.config.app,
    buildConfig: app.config.build,
    layouts: app.layouts,
    plugins: app.plugins,
  };
};
