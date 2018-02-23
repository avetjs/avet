function getDisplayName(Component) {
  return Component.displayName || Component.name || 'UnKnown';
}

function isResSent(res) {
  return res.finished || res.headersSent;
}

async function loadGetInitialProps(Component, ctx) {
  const getProps = Component.getInitialProps || Component.getProps;
  if (!getProps) return {};

  const props = await getProps(ctx);
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
