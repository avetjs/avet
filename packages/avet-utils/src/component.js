function getDisplayName(Component) {
  return Component.displayName || Component.name || 'UnKnown';
}

async function loadGetInitialProps(Component, ctx) {
  if (!Component.getInitialProps) return {};

  const props = Component.getInitialProps(ctx);
  if (!props && (!ctx.res || !ctx.res.finished)) {
    const compName = getDisplayName(Component);
    const message = `"${
      compName
    }.getInitialProps()" should resolve to an object. But found "${
      props
    }" instead.`;
    throw new Error(message);
  }

  return props;
}

module.exports = {
  getDisplayName,
  loadGetInitialProps,
};
