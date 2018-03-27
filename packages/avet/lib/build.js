const Application = require('./application');
const { getAverConfiguration } = require('./utils');
const { createBuild } = require('avet-build');

module.exports = options => {
  const app = new Application(options);
  const { dir } = app.config.app;
  const config = getAverConfiguration(app);

  (async () => {
    await createBuild(dir, config);
    await Promise.all(app.afterBuildFnList);
    process.exit(0);
  })();
};
