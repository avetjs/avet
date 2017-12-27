const devMiddleware = require('webpack-dev-middleware');
const hotMiddleware = require('webpack-hot-middleware');
const { PassThrough } = require('stream');

/**
 * @method koaDevware
 * @desc   Middleware for Koa to proxy webpack-dev-middleware
 **/
function koaDevware(dev, compiler) {
  /**
   * @method waitMiddleware
   * @desc   Provides blocking for the Webpack processes to complete.
   **/
  function waitMiddleware() {
    return new Promise((resolve, reject) => {
      dev.waitUntilValid(() => {
        resolve(true);
      });

      compiler.plugin('failed', error => {
        reject(error);
      });
    });
  }

  const fn = async (context, next) => {
    await waitMiddleware();
    await new Promise(resolve => {
      dev(
        context.req,
        {
          end: content => {
            context.body = content;
            resolve();
          },
          setHeader: context.set.bind(context),
          locals: context.state,
        },
        () => resolve(next())
      );
    });
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
  const fn = async (context, next) => {
    const stream = new PassThrough();

    await hot(
      context.req,
      {
        write: stream.write.bind(stream),
        writeHead: (status, headers) => {
          context.body = stream;
          context.status = status;
          context.set(headers);
        },
      },
      next
    );
  };

  Object.keys(hot).forEach(p => {
    fn[p] = hot[p];
  });

  return fn;
}

exports.koaDevMiddleware = (compiler, options) => {
  const dev = devMiddleware(compiler, options);
  return koaDevware(dev, compiler);
};

exports.koaHotMiddleware = (compiler, options) => {
  const hot = hotMiddleware(compiler, options);
  return koaHotware(hot, compiler);
};
