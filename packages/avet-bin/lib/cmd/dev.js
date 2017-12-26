require('source-map-support/register');

const debug = require('debug')('avet-bin:dev');
const { join, isAbsolute } = require('path');
const { DevCommand } = require('egg-bin');
const utils = require('avet-utils');
const detect = require('detect-port');

module.exports = class extends DevCommand {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: avet-bin dev [dir] [options]';

    this.defaultPort = 3000;
    this.serverBin = join(__dirname, '../start-app');
  }

  *run(context) {
    const devArgs = yield this.formatArgs(context);
    const options = {
      execArgv: context.execArgv,
      env: { NODE_ENV: 'development' },
    };

    debug(
      '%s %j %j, %j',
      this.serverBin,
      devArgs,
      options.execArgv,
      options.env.NODE_ENV
    );

    yield this.helper.forkNode(this.serverBin, devArgs, options);
  }

  *formatArgs(context) {
    const { cwd, argv } = context;
    argv.baseDir = argv._[0] || argv.baseDir || cwd;

    if (!isAbsolute(argv.baseDir)) {
      argv.baseDir = join(cwd, argv.baseDir);
    }

    if (!isAbsolute(argv.rootDir)) {
      argv.rootDir = join(argv.baseDir, argv.rootDir);
    }

    argv.port = argv.port || argv.p;

    argv.framework = utils.getFrameworkPath({
      framework: argv.framework,
      baseDir: argv.baseDir,
      rootDir: argv.rootDir,
    });

    argv.p = undefined;
    argv._ = undefined;
    argv.$0 = undefined;

    // auto detect available port
    if (!argv.port) {
      debug('detect available port');
      const port = yield detect(this.defaultPort);
      argv.port = port;
      if (port !== this.defaultPort) {
        console.warn(
          `[avet-bin] server port ${
            this.defaultPort
          } is in use, now using port ${port}\n`
        );
        return;
      }
      debug(`use available port ${port}`);
    }
    return [ JSON.stringify(argv) ];
  }
};
