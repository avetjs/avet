'use strict';

const path = require('path');

// Build setting
exports.build = {
  distDir: '.avet',
  assetPrefix: '',
  webpack: null,
  webpackDevMiddleware: {
    publicPath: '/_avet/webpack/',
    noInfo: true,
    quiet: true,
    clientLogLevel: 'warning',
    watchOptions: {
      ignored: [
        /(^|[/\\])\../, // .dotfiles
        /node_modules/,
      ]
    },
  },
  webpackHotMiddleware: {
    path: '/_avet/webpack-hmr',
    log: false,
    heartbeat: 2500,
  },
  babel: null,
  // exportPathMap: await () => {}
}

// Setting server
exports.server = {
  dir: path.join(process.cwd(), ''),
  dev: true,
  port: 3000,
  staticMarkup: false,
  quite: false,
  proxy: null,
  poweredByHeader: true,
  configOrigin: 'default',
  useFileSystemPublicRoutes: true,
};
