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

    const { dir } = app.config.avet;
    const buildConfig = app.config.build;

    debug(`build dir is ${dir}`);
    debug(`build config is ${JSON.stringify(buildConfig, null, 2)}`);

    const projectConfig = app.config.avet;

    projectConfig.baseDir = options.baseDir || projectConfig.baseDir;
    projectConfig.rootDir = options.rootDir || projectConfig.rootDir;
    projectConfig.buildConfig = app.config.build;
    projectConfig.appConfig = app.config;
    projectConfig.extendConfig = app.extends;
    projectConfig.plugins = app.plugins;

    createBuild(dir, projectConfig);
  });
};
