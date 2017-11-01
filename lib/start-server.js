'use strict';

const fs = require('fs');
const AvetServer = require('avet-server/lib/server');
const Application = require('./avet');

const debug = require('debug')('avet:start-server');

module.exports = () => {
  const app = new Application();

  app.ready(async err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const serverOptions = app.config.server;
    serverOptions.buildConfig = app.config.build;
    serverOptions.appConfig = app.config;
    serverOptions.extendConfig = app.extends;

    const avetServer = new AvetServer(serverOptions);
    await avetServer.prepare();

    app.use(function* (next) {
      yield avetServer.run(this, next);

      if (!this.res.finished) {
        yield next;
      }
    });

    startServer(app.config.server);
  });

  function startServer(options) {
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

    const args = [ options.port ];
    debug('listen options %s', args);
    server.listen(...args, () => {
      console.log('> Avet server listen at port: %s', options.port);
    });
  }
};
