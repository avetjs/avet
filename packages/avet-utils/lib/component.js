function getDisplayName(Component) {
  return Component.displayName || Component.name || 'UnKnown';
}

function loadGetInitialProps(Component, ctx) {
  return new Promise(function(resolve, reject) {
    if (!Component.getInitialProps) return resolve({});

    Component.getInitialProps(ctx).then(function(props) {
      if (!props && (!ctx.res || !ctx.res.finished)) {
        const compName = getDisplayName(Component);
        const message = `"${
          compName
        }.getInitialProps()" should resolve to an object. But found "${
          props
        }" instead.`;
        return reject(message);
      }

      return resolve(props);
    })
  })
}

module.exports = {
  getDisplayName,
  loadGetInitialProps,
};
