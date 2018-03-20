const { startApp, curl } = require('../utils');

const mm = require('egg-mock');
const rendering = require('./rendering');
const dynamic = require('./dynamic');

const timeout = 40000;

describe('Basic', () => {
  // const baseDir = getFilepath('basic');
  let server;

  beforeAll(async done => {
    try {
      server = await startApp('basic');
    } catch (err) {
      console.warn(err);
    }

    try {
      await Promise.all([
        curl(`${server.url}/async-props`),
        curl(`${server.url}/custom-encoding`),
        curl(`${server.url}/custom-extension`),
        curl(`${server.url}/empty-get-initial-props`),
        curl(`${server.url}/error`),
        curl(`${server.url}/head`),
        curl(`${server.url}/index`),
        curl(`${server.url}/json`),
        curl(`${server.url}/link`),
        curl(`${server.url}/no-default-export`),
        curl(`${server.url}/stateful`),
        curl(`${server.url}/stateless`),
        curl(`${server.url}/styled-jsx`),
        curl(`${server.url}/with-cdm`),
        curl(`${server.url}/nav`),
        curl(`${server.url}/nav/about`),
        curl(`${server.url}/nav/as-path-using-router`),
        curl(`${server.url}/nav/as-path`),
        curl(`${server.url}/nav/hash-changes`),
        curl(`${server.url}/nav/index`),
        curl(`${server.url}/nav/pass-href-prop`),
        curl(`${server.url}/nav/querystring`),
        curl(`${server.url}/nav/redirect`),
        curl(`${server.url}/nav/self-reload`),
        curl(`${server.url}/nav/shallow-routing`),
        curl(`${server.url}/nav/with-hoc`),
        curl(`${server.url}/nested-cdm/index`),
        curl(`${server.url}/hmr/about`),
        curl(`${server.url}/hmr/contact`),
        curl(`${server.url}/hmr/counter`),
        curl(`${server.url}/dynamic/ssr`),
        curl(`${server.url}/dynamic/no-ssr`),
        curl(`${server.url}/dynamic/no-ssr-custom-loading`),
        curl(`${server.url}/dynamic/bundle`),
      ]);
    } catch (err) {
      console.warn(err);
    }

    await new Promise(resolve => {
      setTimeout(resolve, timeout - 10000);
    });

    done();
  }, timeout);

  afterAll(() => {
    server.instance.proc.kill('SIGTERM');
  });

  afterEach(mm.restore);

  rendering();
  dynamic();
});
