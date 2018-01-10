const { join } = require('path');
const { fork } = require('coffee');

const avetBin = require.resolve('../../../bin/avet-bin.js');
const cwd = join(__dirname, '../../fixtures/test-files');

describe('Basic', () => {
  it('should ignore node_modules and fixtures', done => {
    fork(avetBin, [ 'test' ], {
      cwd: join(__dirname, '../../fixtures/test-files-glob'),
    })
      // jest 是用 stderr 作为 base output 的
      // https://github.com/facebook/jest/blob/4f8f6fba35c1cedfb2ce3cb622831c188b221af5/packages/jest-cli/src/reporters/base_reporter.js#L20-L22
      .expect('stderr', /should test index/)
      .expect('stderr', /should test sub/)
      .notExpect('stderr', /no-load\.test\.js/)
      .expect('code', 0)
      .end(done);
  });

  it('should only test files specified by TESTS', done => {
    fork(avetBin, [ 'test' ], { cwd, env: { TESTS: 'test/a.test.js' } })
      .expect('stderr', /should success/)
      .expect('stderr', /a\.test\.js/)
      .notExpect('stderr', /b\/b.test.js/)
      .expect('code', 0)
      .end(done);
  });

  it('should only test files specified by TESTS argv', done => {
    fork(avetBin, [ 'test', 'test/a.test.js' ], {
      cwd,
      env: { TESTS: 'test/**/*.test.js' },
    })
      .expect('stderr', /should success/)
      .expect('stderr', /a\.test\.js/)
      .notExpect('stderr', /b\/b.test.js/)
      .expect('code', 0)
      .end(done);
  });

  it('should auto require test/.setup.js', () => {
    // example: https://github.com/lelandrichardson/enzyme-example-mocha
    return (
      fork(avetBin, [ 'test' ], {
        cwd: join(__dirname, '../../fixtures/enzyme-setup'),
      })
        // .debug()
        .expect('stderr', /3 passed/)
        .expect('code', 0)
        .end()
    );
  });
});

describe('Enzyme', () => {
  it('should success', done => {
    fork(avetBin, [ 'test' ], { cwd: join(__dirname, '../../fixtures/enzyme') })
      .expect('code', 0)
      .end(done);
  });
});

describe('Puppeteer', () => {
  it('should success', done => {
    fork(avetBin, [ 'test' ], {
      cwd: join(__dirname, '../../fixtures/puppeteer'),
    })
      .expect('code', 0)
      .end(done);
  });
});
