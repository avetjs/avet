'use strict';

const CSSSplitWebpackPlugin = require('css-split-webpack-plugin').default;

const isDev = process.env.NODE_ENV === 'development';
const usePreact = process.env.REACT_ENV === 'preact';

module.exports = {
  port: 8001,
  source: {
    docs: './docs',
  },
  theme: './site/theme',
  htmlTemplate: './site/theme/static/template.html',
  themeConfig: {
    categoryOrder: {
      Features: 2,
      特性: 2,
      Backend: 3,
      后端: 3,
      Plugins: 4,
      插件: 4,
    },
    featuresOrder: {
      ssr: 1,
      codesplit: 2,
      cssinjs: 3,
      compilebuild: 4,
      hotreload: 5,
      prefetch: 6,
      cdn: 7,
      plugin: 8,
    },
  },
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
    } else {
      config.externals = Object.assign({}, config.externals, {
        react: 'React',
        'react-dom': 'ReactDOM',
      });
    }

    config.plugins.push(new CSSSplitWebpackPlugin({ size: 4000 }));

    return config;
  },

  htmlTemplateExtraData: {
    isDev,
    usePreact,
  },

  root: '/avet/',
};
