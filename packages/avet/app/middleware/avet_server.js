module.exports = () => {
  return async function avetServer(ctx, next) {
    await ctx.avetServer.run(ctx, next);

    if (!ctx.res.finished || !ctx.body) {
      await next();
    }
  };
};
