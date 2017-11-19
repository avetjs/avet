const path = require('path');
const fs = require('mz/fs');
const debug = require('debug')('avet:test');
const { TestCommand } = require('egg-bin');
const globby = require('globby');

class AvetTestCommand extends TestCommand {
  constructor(rawArgv) {
    super(rawArgv);

    this.usage = 'Usage: avet test [files] [options]';
    this.options = {
      grep: {
        description: 'only run tests matching <pattern>',
        alias: 'g',
        type: 'array',
      },
    };
  }

  get description() {
    return '执行 jest 测试';
  }

  *run(context) {
    yield this.checkDependencies();

    const opt = {
      execArgv: context.execArgv,
      env: Object.assign({ NODE_ENV: 'test' }, context.env),
    };

    const binFile = require.resolve('jest-cli/bin/jest.js');
    const testArgs = this.formatTestArgs(context);

    debug('run test: %s %s', binFile, testArgs.join(' '));

    yield this.patchJestGeneratorSupport();
    yield this.helper.forkNode(binFile, testArgs, opt);
  }
  /**
   * format test args then change it to array style
   * @param {Object} context - { cwd, argv, ...}
   * @return {Array} [ '--require=xxx', 'xx.test.js' ]
   * @protected
   */
  formatTestArgs({ argv, debug, cwd }) {
    const testArgv = Object.assign({}, argv);
    /* istanbul ignore next */
    // testArgv.timeout = testArgv.timeout || process.env.TEST_TIMEOUT || 60000;
    testArgv.reporter = testArgv.reporter || process.env.TEST_REPORTER;

    if (debug) {
      // --no-timeouts
      // testArgv.timeouts = false;
      // testArgv.timeout = undefined;
    }
    // collect require
    // let requireArr = testArgv.require || testArgv.r || [];
    /* istanbul ignore next */
    // if (!Array.isArray(requireArr)) requireArr = [ requireArr ];
    // testArgv.require = requireArr;
    // collect test files
    let files = testArgv._.slice();
    if (!files.length) {
      files = [ process.env.TESTS || 'test/**/*.test.js' ];
    }
    // expand glob and skip node_modules and fixtures
    files = globby.sync(
      files.concat('!test/**/{fixtures, node_modules}/**/*.test.js'),
      { cwd }
    );
    // auto add setup file as the first test file
    // const setupFile = path.join(cwd, 'test/.setup.js');
    // if (fs.existsSync(setupFile)) {
    //   files.unshift(setupFile);
    // }
    testArgv._ = files;
    // remove alias
    testArgv.$0 = undefined;
    testArgv.r = undefined;
    testArgv.t = undefined;
    testArgv.g = undefined;

    return this.helper.unparseArgv(testArgv);
  }

  *patchJestGeneratorSupport() {
    const src = 'const returnValue = fn.call({});';
    const target =
      "if (fn.constructor && fn.constructor.name === 'GeneratorFunction') fn = require('co').wrap(fn);\nconst returnValue = fn.call({});";

    let file;
    try {
      file = require.resolve('jest-jasmine2/build/jasmine-async.js');
    } catch (_) {
      file = path.join(
        __dirname,
        '../../node_modules/jest-cli/node_modules/jest-jasmine2/build/jasmine-async.js'
      );
    }
    if (!(yield fs.exists(file))) return;

    let content = yield fs.readFile(file, 'utf8');
    // 已经 patch 过了，不再重复操作
    if (content.includes(target)) {
      return;
    }

    const placeHolder = '{{placeHolder}}';
    while (content.includes(src)) {
      content = content.replace(src, placeHolder);
    }
    content = content.replace(/\{\{placeHolder\}\}/g, target);

    console.warn('[avet] hotpatch %s', file);

    yield fs.writeFile(file, content);
  }
}

module.exports = AvetTestCommand;
