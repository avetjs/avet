const Application = require('./application');
const { getAverConfiguration } = require('./utils');
const { createBuild } = require('avet-build');

module.exports = options => {
  const app = new Application(options);
  const { dir } = app.config.app;
  const config = getAverConfiguration(app);

  (async () => {
    try {
      await createBuild(dir, config);
      await Promise.all(
        app.afterBuildFnList.map(async fn => {
          await fn();
        })
      );
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
};
