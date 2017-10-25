import { resolve, relative } from 'path';

module.exports = function(content, sourceMap) {
  this.cacheable();

  const route = getRoute(this);

  this.callback(
    null,
    `${content}
    (function (Component, route) {
      if (!module.hot) return
      if (!__resourceQuery) return

      var qs = require('querystring')
      var params = qs.parse(__resourceQuery.slice(1))
      if (params.entry == null) return

      module.hot.accept()
      Component.__route = route

      if (module.hot.status() === 'idle') return

      var components = avet.router.components
      for (var r in components) {
        if (!components.hasOwnProperty(r)) continue

        if (components[r].Component.__route === route) {
          avet.router.update(r, Component)
        }
      }
    })(typeof __webpack_exports__ !== 'undefined' ? __webpack_exports__.default : (module.exports.default || module.exports), ${JSON.stringify(
    route
  )})
  `,
    sourceMap
  );
};

const avetPagesDir = resolve(__dirname, '..', '..', 'page');

function getRoute(loaderContext) {
  const pagesDir = resolve(loaderContext.options.context, 'page');
  const { resourcePath } = loaderContext;
  const dir = [ pagesDir, avetPagesDir ].find(d => resourcePath.indexOf(d) === 0);
  const path = relative(dir, resourcePath);
  return '/' + path.replace(/((^|\/)index)?\.js$/, '');
}
