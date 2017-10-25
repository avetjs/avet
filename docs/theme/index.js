'use strict';

const path = require('path');

const contentTmpl = './template/Content/index';

function pickerGenerator(module) {
  const tester = new RegExp(`^docs/${module}`);
  return markdownData => {
    const { filename } = markdownData.meta;
    if (tester.test(filename) &&
        !/\/demo$/.test(path.dirname(filename))) {
      return {
        meta: markdownData.meta,
      };
    }
  };
}

module.exports = {
  lazyLoad(nodePath, nodeValue) {
    if (typeof nodeValue === 'string') {
      return true;
    }
    return nodePath.endsWith('/demo');
  },
  path: '/',
  component: './template/Layout/index',
  pick: {
    changelog(markdownData) {
      if (/CHANGELOG/.test(markdownData.meta.filename)) {
        return {
          meta: markdownData.meta,
        };
      }
    },
    'docs/resource': pickerGenerator('resource'),
    'docs/spec': pickerGenerator('spec'),
  },
  plugins: [
    'bisheng-plugin-antd',
    'bisheng-plugin-react?lang=__react',
  ],
  routes: [{
    path: '/index-cn',
    component: './template/Avet',
  }, {
    path: '/docs/spec/:children',
    component: contentTmpl,
  }, {
    path: '/docs/resource/:children',
    component: contentTmpl,
  }, {
    path: '/404',
    component: './template/NotFound',
  }],
};
