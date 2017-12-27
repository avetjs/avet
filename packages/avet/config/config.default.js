const path = require('path');

// build setting
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

// project setting
exports.app = {
  dir: path.join(process.cwd(), 'web'),
  dev: true,
  port: 3000,
  staticMarkup: false,
  quite: false,
  configOrigin: 'default',
  useFileSystemPublicRoutes: true,
};

exports.core = {
  name: 'Avet',
};

exports.coreMiddleware = [
  'meta',
  'siteFile',
  'notfound',
  'bodyParser',
  'overrideMethod',
  'avetServer',
];
