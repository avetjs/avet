const path = require('path');
const Command = require('./lib/command');

class AvetBin extends Command {
  constructor(rawArgv) {
    super(rawArgv);

    this.usage = 'Usage: avet-bin [command] [options]';

    this.load(path.join(__dirname, 'lib/cmd'));
  }
}

AvetBin.Command = Command;
AvetBin.DevCommand = require('./lib/cmd/dev');
AvetBin.TestCommand = require('./lib/cmd/test');
AvetBin.BuildCommand = require('./lib/cmd/build');

module.exports = AvetBin;
