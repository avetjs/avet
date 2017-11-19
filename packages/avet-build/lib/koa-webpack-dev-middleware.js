const expressMiddleware = require('webpack-dev-middleware');

function middleware(doIt, req, res) {
  const originalEnd = res.end;

  return function(done) {
    res.end = function end(...args) {
      originalEnd.apply(this, args);
      done(null, 0);
    };
    doIt(req, res, () => {
      done(null, 1);
    });
  };
}

module.exports = function(compiler, option) {
  const doIt = expressMiddleware(compiler, option);

  function* koaMiddleware(next) {
    const ctx = this;
    const { req } = ctx;

    const locals = ctx.locals || ctx.state;

    ctx.webpack = doIt;

    const runNext = yield middleware(doIt, req, {
      end: function end(content) {
        ctx.body = content;
      },
      locals,
      setHeader: function setHeader(...args) {
        ctx.set(...args);
      },
    });

    if (runNext) {
      yield* next;
    }
  }

  Object.keys(doIt).forEach(p => {
    koaMiddleware[p] = doIt[p];
  });

  return koaMiddleware;
};
