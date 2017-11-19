const webpackHotMiddleware = require('webpack-hot-middleware');

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
  const doIt = webpackHotMiddleware(compiler, option);

  function* koaMiddleware(next) {
    const nextStep = yield middleware(doIt, this.req, this.res);

    if (nextStep && next) {
      yield* next;
    }
  }

  Object.keys(doIt).forEach(p => {
    koaMiddleware[p] = doIt[p];
  });

  return koaMiddleware;
};
