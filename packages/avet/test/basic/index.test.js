const { startApp, curl } = require('../utils');

const mm = require('egg-mock');
const rendering = require('./rendering');

const timeout = 40000;

describe('Basic', () => {
  afterEach(mm.restore);

  // const baseDir = getFilepath('basic');
  let server;

  beforeAll(async () => {
    try {
      server = await startApp('basic');
    } catch (err) {
      console.error(err);
    }

    await Promise.all([
      curl(`${server.url}/async-props`),
      // curl(`${url}/empty-get-initial-props`),
      curl(`${server.url}/error`),
      curl(`${server.url}/finish-response`),
      curl(`${server.url}/head`),
      curl(`${server.url}/json`),
      curl(`${server.url}/link`),
      curl(`${server.url}/stateful`),
      curl(`${server.url}/stateless`),
      curl(`${server.url}/styled-jsx`),
      curl(`${server.url}/with-cdm`),
      curl(`${server.url}/custom-extension`),
      curl(`${server.url}/nav`),
      curl(`${server.url}/nav/about`),
      curl(`${server.url}/nav/querystring`),
      curl(`${server.url}/nav/self-reload`),
      curl(`${server.url}/nav/self-reload`),
      curl(`${server.url}/nav/shallow-routing`),
      curl(`${server.url}/nav/redirect`),
      curl(`${server.url}/nav/as-path`),
      curl(`${server.url}/nav/as-path-using-router`),
      curl(`${server.url}/nested-cdm/index`),
      curl(`${server.url}/hmr/about`),
      curl(`${server.url}/hmr/contact`),
      curl(`${server.url}/hmr/counter`),
    ]);

    await new Promise(resolve => {
      setTimeout(resolve, 10000);
    });
  }, timeout);

  afterAll(() => {
    server.instance.send('app-exit');
  });

  rendering();
});
