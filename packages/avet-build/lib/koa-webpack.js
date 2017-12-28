const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');
// const { PassThrough } = require('stream');

function middleware(doIt, req, res) {
  const originalEnd = res.end;

  return new Promise(resolve => {
    res.end = function end(...args) {
      originalEnd.apply(this, args);
      resolve(0);
    };
    doIt(req, res, () => {
      resolve(1);
    });
  });
}

/**
 * @method koaDevware
 * @desc   Middleware for Koa to proxy webpack-dev-middleware
 **/
function koaDevware(dev) {
  // /**
  //  * @method waitMiddleware
  //  * @desc   Provides blocking for the Webpack processes to complete.
  //  **/
  // function waitMiddleware() {
  //   return new Promise((resolve, reject) => {
  //     dev.waitUntilValid(() => {
  //       resolve(true);
  //     });

  //     compiler.plugin('failed', error => {
  //       reject(error);
  //     });
  //   });
  // }

  const fn = async (ctx, next) => {
    // await waitMiddleware();
    // await new Promise(resolve => {
    //   dev(
    //     context.req,
    //     {
    //       end: content => {
    //         context.body = content;
    //         resolve();
    //       },
    //       setHeader: context.set.bind(context),
    //       locals: context.state,
    //     },
    //     () => resolve(next())
    //   );
    // });
    const { req } = ctx;
    const locals = ctx.locals || ctx.state;

    ctx.webpack = dev;

    const runNext = await middleware(dev, req, {
      end: function end(content) {
        ctx.body = content;
      },
      locals,
      setHeader: function setHeader(...args) {
        ctx.set(...args);
      },
    });

    if (runNext) {
      await next();
    }
  };

  Object.keys(dev).forEach(p => {
    fn[p] = dev[p];
  });

  return fn;
}

/**
 * @method koaHotware
 * @desc   Middleware for Koa to proxy webpack-hot-middleware
 **/
function koaHotware(hot) {
  const fn = async (ctx, next) => {
    const nextStep = await middleware(hot, ctx.req, ctx.res);
    if (nextStep && next) {
      await next();
    }
    // const stream = new PassThrough();
    // await hot(
    //   ctx.req,
    //   {
    //     write: stream.write.bind(stream),
    //     writeHead: (status, headers) => {
    //       ctx.body = stream;
    //       ctx.status = status;
    //       ctx.set(headers);
    //     },
    //   },
    //   next
    // );
  };

  Object.keys(hot).forEach(p => {
    fn[p] = hot[p];
  });

  return fn;
}

exports.koaDevMiddleware = (compiler, options) => {
  const dev = devMiddleware(compiler, options);
  return koaDevware(dev);
};

exports.koaHotMiddleware = (compiler, options) => {
  const hot = hotMiddleware(compiler, options);
  return koaHotware(hot);
};
