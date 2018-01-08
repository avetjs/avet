import * as utils from './utils';
import mm from 'egg-mock';

describe('Basic', () => {
  afterEach(mm.restore);

  const baseDir = utils.getFilepath('apps/basic');
  let app;

  beforeAll(async () => {
    app = utils.app('apps/demo');
    await app.ready();

    const url = await utils.startLocalServer();
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
      app.curl(`${url}/styled-jsx`),

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
  });

  afterAll(() => app.close());
});
