module.exports = () => {
  return async function avetServer(ctx, next) {
    await ctx.avetServer.run(ctx, next);

    if (!this.res.finished) {
      await next();
    }
  };
};
