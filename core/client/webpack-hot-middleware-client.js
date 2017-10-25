import webpackHotMiddlewareClient from 'webpack-hot-middleware/client?overlay=false&reload=true&path=/_avet/webpack-hmr';
import Router from '../shared/router';

export default () => {
  const handlers = {
    reload(route) {
      if (route === '/_error') {
        for (const r of Object.keys(Router.components)) {
          const { err } = Router.components[r];
          if (err) {
            // reload all error routes
            // which are expected to be errors of '/_error' routes
            Router.reload(r);
          }
        }
        return;
      }

      if (route === '/_document') {
        window.location.reload();
        return;
      }

      Router.reload(route);
    },

    change(route) {
      if (route === '/_document') {
        window.location.reload();
        return;
      }

      const { err, Component } = Router.components[route] || {};

      if (err) {
        // reload to recover from runtime errors
        Router.reload(route);
      }

      if (Router.route !== route) {
        // If there is a not a change for a currently viewing page.
        // We don't need to worray about it.
        return;
      }

      if (!Component) {
        // This only happens when we create a new page without a default export.
        // If you removed a default export from a exising viewing page, this has no effect.
        console.log(
          `Hard reloading due to no default component in page: ${route}`
        );
        window.location.reload();
      }
    },
  };

  webpackHotMiddlewareClient.subscribe(obj => {
    const fn = handlers[obj.action];
    if (fn) {
      const data = obj.data || [];
      fn(...data);
    } else {
      throw new Error('Unexpected action ' + obj.action);
    }
  });
};
