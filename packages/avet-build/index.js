exports.createCompiler = require('./lib/compiler');
exports.createBuild = require('./lib/build');
exports.WebpackDevMiddleware = require('./lib/koa-webpack-dev-middleware');
exports.WebpackHotMiddleware = require('./lib/koa-webpack-hot-middleware');

exports.requireModule = function(path) {
  return require(path);
};
