const path = require('path');

// Build setting
exports.build = {
  distDir: '.build',
  assetPrefix: '',
  webpack: null,
  webpackDevMiddleware: {
    publicPath: '/_app/webpack/',
    noInfo: true,
    quiet: true,
    clientLogLevel: 'warning',
    watchOptions: {
      ignored: [
        /(^|[/\\])\../, // .dotfiles
        /node_modules/,
      ],
    },
  },
  webpackHotMiddleware: {
    path: '/_app/webpack-hmr',
    log: false,
    heartbeat: 2500,
  },
  babel: {},
  onDemandEntries: null,
  hotReload: true,
  // exportPathMap: await () => {}
};

// Setting avet
exports.app = {
  dir: path.join(process.cwd(), ''),
  dev: true,
  port: 3000,
  staticMarkup: false,
  quite: false,
  proxy: null,
  configOrigin: 'default',
  useFileSystemPublicRoutes: true,
};
