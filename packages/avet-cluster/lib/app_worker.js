const fs = require('fs');
const debug = require('debug')('avet-cluster');
const gracefulExit = require('graceful-process');
// $ node app_worker.js options
const options = JSON.parse(process.argv[2]);

const { Application } = require(options.framework);
debug('new Application with options %j', options);
const app = new Application(options);
const clusterConfig = app.config.cluster || /* istanbul ignore next */ {};
const listenConfig = clusterConfig.listen || /* istanbul ignore next */ {};
const port = (options.port = options.port || listenConfig.port);
process.send({ to: 'master', action: 'realport', data: port });
app.ready(startServer);

// exit if worker start timeout
app.once('startTimeout', startTimeoutHandler);
function startTimeoutHandler() {
  console.error('[app_worker] start timeout, exiting with code:1');
  process.exit(1);
}

function startServer(err) {
  if (err) {
    console.error(err);
    console.error('[app_worker] start error, exiting with code:1');
    process.exit(1);
  }

  app.removeListener('startTimeout', startTimeoutHandler);

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
    console.error(
      '[app_worker] server got error: %s, code: %s',
      err.message,
      err.code
    );
    process.exit(1);
  });

  // emit `server` event in app
  app.emit('server', server);

  if (options.sticky) {
    server.listen(0, '127.0.0.1');
    // Listen to messages sent from the master. Ignore everything else.
    process.on('message', (message, connection) => {
      if (message !== 'sticky-session:connection') {
        return;
      }

      // Emulate a connection event on the server by emitting the
      // event with the connection the master sent us.
      server.emit('connection', connection);
      connection.resume();
    });
  } else {
    if (listenConfig.path) {
      server.listen(listenConfig.path);
    } else {
      if (typeof port !== 'number') {
        console.error(
          '[app_worker] port should be number, but got %s(%s)',
          port,
          typeof port
        );
        process.exit(1);
      }
      const args = [ port ];
      if (listenConfig.hostname) args.push(listenConfig.hostname);
      debug('listen options %s', args);
      server.listen(...args);
    }
  }
}

gracefulExit({
  logger: console,
  label: 'app_worker',
});
