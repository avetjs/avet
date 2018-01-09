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
      testEnvironment: require.resolve('../jest/puppeteer_environment.js'),
      globalTeardown: require.resolve('../jest/teardown.js'),
      globalSetup: require.resolve('../jest/setup.js'),
      moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'md' ],
      transform: {
        '^.+\\.(ts|tsx)$': require.resolve('ts-jest/preprocessor.js'),
        '^.+\\.js$': require.resolve('../jest/transformer.js'),
      },
      testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
      testPathIgnorePatterns: [ '/node_modules/', 'node', 'config' ],
      testURL: 'http://localhost',
      snapshotSerializers: [ require.resolve('enzyme-to-json/serializer') ],
    };
  }

  *run(context) {
    const opts = {
      exevArgv: context.exevArgv,
      env: Object.assign({ NODE_ENV: 'test' }, context.env),
    };

    const binFile = require.resolve('jest/bin/jest.js');
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
