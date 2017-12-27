module.exports = () => {
  return async function avetServer(ctx, next) {
    await ctx.avetServer.run(this, next);

    if (!this.res.finished) {
      await next();
    }
  };
};
