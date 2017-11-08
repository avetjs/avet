'use strict';

const path = require('path');
const CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default;

const isDev = process.env.NODE_ENV === 'development';
const usePreact = process.env.REACT_ENV === 'preact';

module.exports = {
  port: 8001,
  source: {
    docs: './docs/source',
  },
  theme: './docs/theme',
  htmlTemplate: './docs/theme/static/template.html',
  plugins: [
    'bisheng-plugin-react?lang=__react',
    'bisheng-plugin-antd',
  ],
  filePathMapper(filePath) {
    if (filePath === '/index.html') {
      return [ '/index.html', '/index-cn.html' ];
    }
    if (filePath.endsWith('/index.html')) {
      return [ filePath, filePath.replace(/\/index\.html$/, '-cn/index.html') ];
    }
    if (filePath !== '/404.html' && filePath !== '/index-cn.html') {
      return [ filePath, filePath.replace(/\.html$/, '-cn.html') ];
    }
    return filePath;
  },
  webpackConfig(config) {
    config.resolve.alias = {
      'react-router': 'react-router/umd/ReactRouter',
    };

    config.externals = {
      'react-router-dom': 'ReactRouterDOM',
    };

    if (usePreact) {
      config.resolve.alias = Object.assign({}, config.resolve.alias, {
        react: 'preact-compat',
        'react-dom': 'preact-compat',
        'create-react-class': 'preact-compat/lib/create-react-class',
        'react-router': 'react-router',
      });
    } else if (isDev) {
      config.externals = Object.assign({}, config.externals, {
        react: 'React',
        'react-dom': 'ReactDOM',
      });
    }

    // config.babel.plugins.push([
    //   require.resolve('babel-plugin-transform-runtime'),
    //   {
    //     polyfill: false,
    //     regenerator: true,
    //   },
    // ]);

    config.plugins.push(new CSSSplitWebpackPlugin({ size: 4000 }));

    return config;
  },

  htmlTemplateExtraData: {
    isDev,
    usePreact,
  },
};
