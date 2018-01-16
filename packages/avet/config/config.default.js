const path = require('path');

module.exports = appInfo => {
  const exports = {};

  // build setting
  exports.build = {
    distDir: '.build',
    assetPrefix: '',
    webpack: null,
    webpackDevMiddleware: {
      logLevel: 'silent',
      publicPath: '/_app/webpack/',
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
    staticOptions: {
      // cache control max age for the files
      maxAge: 365000000,
      buffer: true,
      gzip: true,
    },
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

  exports.static = {
    prefix: '/static/',
    dir: path.join(appInfo.baseDir, 'web/static'),
  };

  return exports;
};
