const debug = require('debug')('avet-bin');
const { DevCommand } = require('egg-bin');
const utils = require('avet-utils');
const { isAbsolute, join } = require('path');
const detect = require('detect-port');

class AvetDevCommand extends DevCommand {
  *formatArgs(context) {
    const { cwd, argv } = context;
    /* istanbul ignore next */
    argv.baseDir = argv._[0] || argv.baseDir || cwd;
    /* istanbul ignore next */
    if (!isAbsolute(argv.baseDir)) argv.baseDir = join(cwd, argv.baseDir);

    argv.workers = argv.cluster || 1;
    argv.port = argv.port || argv.p;
    argv.framework = utils.getFrameworkPath({
      framework: argv.framework,
      baseDir: argv.baseDir,
    });

    // remove unused properties
    argv.cluster = undefined;
    argv.c = undefined;
    argv.p = undefined;
    argv._ = undefined;
    argv.$0 = undefined;

    // auto detect available port
    if (!argv.port) {
      debug('detect available port');
      const port = yield detect(this.defaultPort);
      if (port !== this.defaultPort) {
        argv.port = port;
        console.warn(
          `[egg-bin] server port ${
            this.defaultPort
          } is in use, now using port ${port}\n`
        );
      }
      debug(`use available port ${port}`);
    }
    return [ JSON.stringify(argv) ];
  }
}

module.exports = AvetDevCommand;
