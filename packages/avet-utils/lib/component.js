function getDisplayName(Component) {
  return Component.displayName || Component.name || 'UnKnown';
}

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

function loadGetInitialProps(Component, ctx) {
  return new Promise(function(resolve, reject) {
    if (!Component.getInitialProps) return resolve({});

    const props = Component.getInitialProps(ctx)
    if (isPromise(props)) {
      props.then(function(p) {
        if (!p && (!ctx.res || !ctx.res.finished)) {
          const compName = getDisplayName(Component);
          const message = `"${
            compName
          }.getInitialProps()" should resolve to an object. But found "${
            p
          }" instead.`;
          return reject(message);
        }

        return resolve(p);
      });
    } else {
      resolve(props);
    }
  })
}

module.exports = {
  getDisplayName,
  loadGetInitialProps,
};
