const { createBuild } = require('avet-build');
const Application = require('./application');
const { getAverConfiguration } = require('./utils');

module.exports = options => {
  const app = new Application(options);

  app.ready(err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const { dir } = app.config.app;
    const config = getAverConfiguration(app);

    createBuild(dir, config);
  });
};
