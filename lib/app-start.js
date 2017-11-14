const fs = require('fs');
const AvetServer = require('avet-server/lib/server');
const Application = require('./avet');

const debug = require('debug')('avet:start-server');

module.exports = options => {
  const app = new Application(options);

  app.ready(async err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const avetOptions = app.config.avet;
    avetOptions.buildConfig = app.config.build;
    avetOptions.appConfig = app.config;
    avetOptions.extendConfig = app.extends;
    avetOptions.plugins = app.plugins;

    const avetServer = new AvetServer(avetOptions);
    await avetServer.prepare();

    if (avetOptions.proxy) {
      const proxy = require('koa-proxy');
      app.use(proxy(avetOptions.proxy));
    }

    app.use(function*(next) {
      yield avetServer.run(this, next);

      if (!this.res.finished) {
        yield next;
      }
    });

    startServer(app.config.avet);
  });

  function startServer(options) {
    let server;
    if (options.https) {
      server = require('https').createServer(
        {
          key: fs.readFileSync(options.key),
          cert: fs.readFileSync(options.cert),
        },
        app.callback()
      );
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
