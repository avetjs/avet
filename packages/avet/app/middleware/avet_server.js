module.exports = () => {
  return async function avetServer(ctx, next) {
    const isAppRouter = ctx.router.stack.find(layer => {
      return layer.match(ctx.path);
    });
    const isStaticRouter = /static/.match(ctx.path);

    // if route define in app/router.js or static route
    if (isAppRouter || isStaticRouter) {
      await next();
    } else {
      await ctx.avetServer.run(ctx, next);
    }
  };
};
