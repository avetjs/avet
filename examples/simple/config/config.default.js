const pkg = require('../package.json');

exports.build = {
  webpackDevMiddleware: {
    noInfo: true,
    quiet: true,
  },
};

// use for cookie sign key, should change to your own and keep security
exports.keys = `${pkg.name}_1509640041953_6564`;
