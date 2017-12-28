const { createBuild } = require('avet-build');
const Application = require('./application');
const { getAverConfiguration } = require('./utils');

module.exports = options => {
  const app = new Application(options);
  const { dir } = app.config.app;
  const config = getAverConfiguration(app);

  createBuild(dir, config);
};
