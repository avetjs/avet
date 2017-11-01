'use strict';

const AvetServer = require('avet-server/lib/server');
const Application = require('./avet');

const debug = require('debug')('avet:start-server');

module.exports = (options) => {
  const app = new Application();

  app.ready((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const serverOptions = app.config.server;
    serverOptions.buildConfig = app.config.build;
    serverOptions.appConfig = app.config;
    serverOptions.extendConfig = app.extends;

    const avetServer = new AvetServer(serverOptions)

    app.use(async (ctx, next) => {
      await avetServer.run(ctx);
      if (!ctx.res.finished) {
        await next();
      }
    });

    startServer(options.port || app.config.server.port);
  });

  function startServer(port) {
    let server;
    if (options.https) {
      server = require('https').createServer({
        key: fs.readFileSync(options.key),
        cert: fs.readFileSync(options.cert),
      }, app.callback());
    } else {
      server = require('http').createServer(app.callback());
    }

    server.once('error', err => {
      console.error('server got error: %s, code: %s', err.message, err.code);
      process.exit(1);
    });

    app.emit('server', server);

    const args = [ port ];
    debug('listen options %s', args);
    server.listen(...args);
  }
}
