const {
  mockApp,
  buildApp,
  // getFilepath,
  startLocalServer,
} = require('../utils');

const mm = require('egg-mock');
const rendering = require('./rendering');

const timeout = 40000;

describe(
  'Basic',
  () => {
    afterEach(mm.restore);

    // const baseDir = getFilepath('basic');
    let app;

    const url = startLocalServer();
    beforeAll(async () => {
      try {
        await buildApp('basic');
      } catch (err) {
        console.error(err);
      }
      // app = mockApp('basic');
      // await app.ready();

      await Promise.all([
        app.curl(`${url}/async-props`),
        app.curl(`${url}/empty-get-initial-props`),
        app.curl(`${url}/error`),
        app.curl(`${url}/finish-response`),
        app.curl(`${url}/head`),
        app.curl(`${url}/json`),
        app.curl(`${url}/link`),
        app.curl(`${url}/stateful`),
        app.curl(`${url}/stateless`),
        app.curl(`${url}/styled-jsx`),
        app.curl(`${url}/with-cdm`),
        app.curl(`${url}/nav`),
        app.curl(`${url}/nav/about`),
        app.curl(`${url}/nav/querystring`),
        app.curl(`${url}/nav/self-reload`),
        app.curl(`${url}/nav/self-reload`),
        app.curl(`${url}/nav/shallow-routing`),
        app.curl(`${url}/nav/redirect`),
        app.curl(`${url}/nav/as-path`),
        app.curl(`${url}/nav/as-path-using-router`),
        app.curl(`${url}/nested-cdm/index`),
        app.curl(`${url}/hmr/about`),
        app.curl(`${url}/hmr/contact`),
        app.curl(`${url}/hmr/counter`),
      ]);
    }, timeout);

    afterAll(() => app.close());

    rendering();
  },
  timeout
);
