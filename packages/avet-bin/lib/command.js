const { join } = require('path');
const pkg = require('../package.json');
const Command = require('egg-bin');

class AvetBinCommand extends Command {
  constructor(rawArgv) {
    super(rawArgv);

    this.usage = 'Usage: avet-bin [command] [options]';

    if (pkg.peerDependencies) {
      Object.keys(pkg.peerDependencies).forEach(dependency => {
        try {
          // When 'npm link' is used it checks the clone location. Not the project.
          require.resolve(dependency);
        } catch (err) {
          console.warn(
            `The module '${dependency}' was not found. Avet requires that you include it in 'dependencies' of your 'package.json'. To add it, run 'npm install --save ${dependency}'`
          );
        }
      });
    }

    this.load(join(__dirname, 'cmd'));
  }
}

module.exports = AvetBinCommand;
