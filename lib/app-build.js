const { createBuild } = require('avet-build');
const Application = require('./avet');

const debug = require('debug')('avet:app-build');

module.exports = options => {
  const app = new Application(options);

  app.ready(err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const dir = app.config.avet.dir;
    const buildConfig = app.config.build;

    debug(`build dir is ${dir}`);
    debug(`build config is ${JSON.stringify(buildConfig, null, 2)}`);

    const options = app.config.avet;
    options.buildConfig = app.config.build;
    options.appConfig = app.config;
    options.extendConfig = app.extends;
    options.plugins = app.plugins;

    createBuild(dir, options);
  });
};
