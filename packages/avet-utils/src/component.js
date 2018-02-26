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
    const message = `"${compName}.getInitialProps() or ${compName}.getProps" should resolve to an object. But found "${props}" instead.`;
    throw new Error(message);
  }

  return props;
}

async function loadGetStore(Component, ctx) {
  const { getStore } = Component;
  if (!getStore) return {};

  const store = await getStore(ctx);
  if (ctx.res && isResSent(ctx.res)) {
    return store;
  }

  if (!store) {
    const compName = getDisplayName(Component);
    const message = `"${compName}.getStore()" should resolve to an object. But found "${store}" instead.`;
    throw new Error(message);
  }

  return store;
}

module.exports = {
  isResSent,
  getDisplayName,
  loadGetStore,
  loadGetProps: loadGetInitialProps,
  loadGetInitialProps,
};
