const path = require('path');
const Command = require('./lib/command');
const { CovCommand, DebugCommand, PkgfilesCommand } = require('egg-bin');

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
exports.CovCommand = CovCommand;
exports.DebugCommand = DebugCommand;
exports.PkgfilesCommand = PkgfilesCommand;
exports.DevCommand = require('./lib/cmd/dev');
exports.TestCommand = require('./lib/cmd/test');
exports.BuildCommand = require('./lib/cmd/build');
