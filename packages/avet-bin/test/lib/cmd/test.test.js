const { join } = require('path');
const { fork } = require('coffee');

describe('test/index.test.js', () => {
  const avetBin = require.resolve('../../../bin/avet-bin.js');
  const cwd = join(__dirname, '../../fixtures/enzyme');

  it('should success', done => {
    fork(avetBin, [ 'test' ], { cwd })
      .debug()
      // .expect('stdout', /\d+\.\d+\.\d+/)
      .expect('code', 0)
      .end(done);
  });
});
