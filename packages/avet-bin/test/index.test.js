const { join } = require('path');
const { fork } = require('coffee');

describe('test/index.test.js', () => {
  const avetBin = require.resolve('../bin/avet-bin.js');
  const cwd = join(__dirname, 'fixtures/test-files');

  describe('global options', () => {
    it('should show version', done => {
      fork(avetBin, [ '--version' ], { cwd })
        // .debug()
        .expect('stdout', /\d+\.\d+\.\d+/)
        .expect('code', 0)
        .end(done);
    });

    it('should show help', done => {
      fork(avetBin, [ '--help' ], { cwd })
        // .debug()
        .expect('stdout', /Usage: .*avet-bin.* \[command] \[options]/)
        .expect('code', 0)
        .end(done);
    });

    it('should show help when command not exists', done => {
      fork(avetBin, [ 'not-exists' ], { cwd })
        // .debug()
        .expect('stdout', /Usage: .*avet-bin.* \[command] \[options]/)
        .expect('code', 0)
        .end(done);
    });
  });
});
