module.exports = function avetServer(dir, options = {}) {
  options.prefix = options.prefix || '_avet';

  return async (ctx, next) => {
    // only accept HEAD and GET
    if (ctx.method !== 'HEAD' && ctx.method !== 'GET') {
      await next();
    }
  };
};
