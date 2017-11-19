const pathMatch = require('path-match');

const route = pathMatch();

class Router {
  constructor() {
    this.routes = new Map();
  }

  add(method, path, fn) {
    const routes = this.routes.get(method) || new Set();
    routes.add({ match: route(path), fn });
    this.routes.set(method, routes);
  }

  match(ctx) {
    const routes = this.routes.get(ctx.method);
    if (!routes) return;

    const pathname = ctx.request.path;
    for (const r of routes) {
      const params = r.match(pathname);
      if (params) {
        return async () => {
          return r.fn(ctx, params);
        };
      }
    }
  }
}

module.exports = Router;
