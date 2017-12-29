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

    const commonConfig = {
      moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'md' ],
      transform: {
        '^.+\\.(ts|tsx)$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
        '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
      },
      testPathIgnorePatterns: [ '/node_modules/' ],
      setupFiles: [ join(__dirname, '../test.setup.js') ],
      snapshotSerializers: [ 'enzyme-to-json/serializer' ],
    };

    this.jestJSDomConfig = Object.assign({}, commonConfig, {
      testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
    });

    this.jestNodeConfig = Object.assign({}, commonConfig, {
      testRegex: '(/^test/.*\\.(test|spec))\\.(ts|tsx|js)$',
      testEnvironment: 'node',
    });
  }

  *run(context) {
    const opts = {
      exevArgv: context.exevArgv,
      env: Object.assign({ NODE_ENV: 'test' }, context.env),
    };

    const pkg = require(join(context.cwd, 'package.json'));
    const binFile = require.resolve('jest-cli/bin/jest.js');

    const jsDomConfig = extend2(true, this.jestJSDomConfig, pkg.jest);
    const testJSDomArgs = this.formatTestArgs(context, jsDomConfig);

    const nodeConfig = extend2(true, this.jestNodeConfig, pkg.jest);
    const testNodeArgs = this.formatTestArgs(context, nodeConfig);

    // run web test
    yield this.helper.forkNode(binFile, testJSDomArgs, opts);
    // run app test
    yield this.helper.forkNode(binFile, testNodeArgs, opts);
  }

  formatTestArgs({ argv, cwd }, jestConfig) {
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
