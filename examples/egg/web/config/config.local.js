const path = require('path');

exports.build = {
  webpackDevMiddleware: {
    noInfo: true,
    quiet: true,
  },
};

exports.avet = {
  dir: path.join(process.cwd(), 'web'),
};

exports.define = {
  API_HOST: 'http://127.0.0.1:7001',
};

exports.proxy = {
  host: 'http://127.0.0.1:7001',
  match: /^\/api\//,
};
