require('source-map-support/register');

const debug = require('debug')('avet-bin:dev');
const path = require('path');
const Command = require('egg-bin');
const utils = require('avet-utils');
const detect = require('detect-port');

class DevCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: avet dev [dir] [options]';

    this.defaultPort = 3000;
    this.serverBin = path.join(__dirname, '../start-app');

    this.options = {
      baseDir: {
        description: 'directory of application, default to `process.cwd()`',
        type: 'string',
      },
      rootDir: {
        description:
          'directory of application root, a application may have multiple root.',
        type: 'string',
        default: './',
      },
      port: {
        description: 'listening port, default to 3000',
        type: 'number',
        alias: 'p',
      },
      framework: {
        description:
          'specify framework that can be absolute path or npm package',
        type: 'string',
      },
      quiet: {
        description: 'is quiet?',
        type: 'boolean',
        default: false,
      },
    };
  }

  get description() {
    return '启动开发';
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

    if (!path.isAbsolute(argv.baseDir)) {
      argv.baseDir = path.join(cwd, argv.baseDir);
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
          `[avet-bin] server port ${this
            .defaultPort} is in use, now using port ${port}\n`
        );
        return;
      }
      debug(`use available port ${port}`);
    }
    return [ JSON.stringify(argv) ];
  }
}

module.exports = DevCommand;
