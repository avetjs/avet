const { getAverConfiguration } = require('./lib/utils');
const AvetServer = require('avet-server/lib/server');

module.exports = app => {
  const config = getAverConfiguration(app);
  app.avetServer = new AvetServer(config);

  console.log('==========');

  app.beforeStart(async () => {
    // check env is local and need prepare ready
    if (app.env === 'local') {
      await app.avetServer.prepare();
    }
  });
};
