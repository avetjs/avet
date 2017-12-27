const path = require('path');
const Command = require('./lib/command');

class AvetBin extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: avet-bin [command] [options]';

    // load directory
    this.load(path.join(__dirname, 'lib/cmd'));
  }
}

module.exports = exports = AvetBin;
exports.Command = Command;
exports.CovCommand = require('./lib/cmd/cov');
exports.DebugCommand = require('./lib/cmd/debug');
exports.DevCommand = require('./lib/cmd/dev');
exports.BuildCommand = require('./lib/cmd/build');
exports.TestCommand = require('./lib/cmd/test');
exports.AutodCommand = require('./lib/cmd/autod');
