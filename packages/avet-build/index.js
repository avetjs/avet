exports.createCompiler = require('./lib/compiler');
exports.createBuild = require('./lib/build');
exports.WebpackDevMiddleware = require('./lib/koa-webpack').koaDevMiddleware;
exports.WebpackHotMiddleware = require('./lib/koa-webpack').koaHotMiddleware;
