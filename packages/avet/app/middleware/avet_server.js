module.exports = () => {
  return async function avetServer(ctx, next) {
    const isAppRoute = ctx.router.stack.find(layer => {
      return layer.match(ctx.path);
    });
    const isStaticRoute = /static/.test(ctx.path);
    const isPublicRoute = /public/.test(ctx.path);

    // if route define in app/router.js or static route or public route
    if (!isAppRoute && !isStaticRoute && !isPublicRoute) {
      await ctx.avetServer.run(ctx);
    }

    if (!ctx.body && !ctx.res.finished) {
      await next();
    }
  };
};
