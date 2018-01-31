function getDisplayName(Component) {
  return Component.displayName || Component.name || 'UnKnown';
}

function isResSent(res) {
  return res.finished || res.headersSent;
}

async function loadGetInitialProps(Component, ctx) {
  if (!Component.getInitialProps) return {};

  const props = await Component.getInitialProps(ctx);
  if (ctx.res && isResSent(ctx.res)) {
    return props;
  }

  if (!props) {
    const compName = getDisplayName(Component);
    const message = `"${compName}.getInitialProps()" should resolve to an object. But found "${props}" instead.`;
    throw new Error(message);
  }

  return props;
}

module.exports = {
  isResSent,
  getDisplayName,
  loadGetInitialProps,
};
