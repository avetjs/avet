exports.createCompiler = require('./lib/createCompiler');
exports.createBuild = require('./lib/createBuild');
exports.WebpackDevMiddleware = require('./lib/koa-webpack-dev-middleware');
exports.WebpackHotMiddleware = require('./lib/koa-webpack-hot-middleware');

exports.requireModule = function(path) {
  return require(path);
};
