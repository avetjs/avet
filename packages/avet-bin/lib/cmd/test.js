const { join } = require('path');
const { TestCommand } = require('egg-bin');
const globby = require('globby');
const extend2 = require('extend2');

class AvetTestCommand extends TestCommand {
  constructor(rawArgv) {
    super(rawArgv);

    this.usage = 'Usage: avet-bin test [files] [options]';
    this.options = {
      grep: {
        description: 'only run tests matching <pattern>',
        alias: 'g',
        type: 'array',
      },
    };

    this.jestDefaultConfig = {
      moduleFileExtensions: [ 'ts', 'tsx', 'js', 'json' ],
      transform: {
        '^.+\\.(ts|tsx)$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
        '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
      },
      testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
      setupFiles: [ join(__dirname, '../test.setup.js') ],
    };
  }

  *run(context) {
    const opts = {
      exevArgv: context.exevArgv,
      env: Object.assign({ NODE_ENV: 'test' }, context.env),
    };

    const binFile = require.resolve('jest-cli/bin/jest.js');
    const testArgs = this.formatTestArgs(context);
    yield this.helper.forkNode(binFile, testArgs, opts);
  }

  formatTestArgs({ argv, cwd }) {
    const pkg = require(join(cwd, 'package.json'));
    const jestConfig = extend2(true, this.jestDefaultConfig, pkg.jest);
    const testArgv = Object.assign({}, argv);

    testArgv.config = JSON.stringify(jestConfig);
    testArgv.reporter = testArgv.reporter || process.env.TEST_REPORTER;

    let files = testArgv._.slice();
    if (!files.length) {
      files = [ process.env.TESTS || 'test/**/*.test.js' ];
    }

    files = globby.sync(
      files.concat('!test/**/{fixtures, node_modules}/**/*.test.js'),
      { cwd }
    );

    testArgv._ = files;
    testArgv.$0 = undefined;
    testArgv.r = undefined;
    testArgv.t = undefined;
    testArgv.g = undefined;

    return this.helper.unparseArgv(testArgv);
  }
}

module.exports = AvetTestCommand;
