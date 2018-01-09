import {
  app as mockApp,
  // getFilepath,
  // startLocalServer,
  newPage,
} from './utils';
import mm from 'egg-mock';

const timeout = 20000;

describe(
  'Basic',
  () => {
    afterEach(mm.restore);

    // const baseDir = getFilepath('basic');
    let app;

    beforeAll(async () => {
      app = mockApp('basic');
      await app.ready();
    }, timeout);

    beforeAll(() => {
      // await Promise.all([
      //   app.curl(`${url}/async-props`),
      //   app.curl(`${url}/empty-get-initial-props`),
      //   app.curl(`${url}/error`),
      //   app.curl(`${url}/finish-response`),
      //   app.curl(`${url}/head`),
      //   app.curl(`${url}/json`),
      //   app.curl(`${url}/link`),
      //   app.curl(`${url}/stateful`),
      //   app.curl(`${url}/stateless`),
      //   app.curl(`${url}/styled-jsx`),
      //   app.curl(`${url}/with-cdm`),
      //   app.curl(`${url}/nav`),
      //   app.curl(`${url}/nav/about`),
      //   app.curl(`${url}/nav/querystring`),
      //   app.curl(`${url}/nav/self-reload`),
      //   app.curl(`${url}/nav/self-reload`),
      //   app.curl(`${url}/nav/shallow-routing`),
      //   app.curl(`${url}/nav/redirect`),
      //   app.curl(`${url}/nav/as-path`),
      //   app.curl(`${url}/nav/as-path-using-router`),
      //   app.curl(`${url}/nested-cdm/index`),
      //   app.curl(`${url}/hmr/about`),
      //   app.curl(`${url}/hmr/contact`),
      //   app.curl(`${url}/hmr/counter`),
      // ]);
    });

    afterAll(() => app.close());

    describe('rendering', () => {
      it('renders a stateless component', async () => {
        const page = await newPage('/stateless');
        const head = await page.evaluate(() => document.head.innerHTML);
        const body = await page.evaluate(() => document.body.textContent);

        expect(
          head.includes('<meta charSet="utf-8" class="avet-head"/>')
        ).toBeTruthy();
        expect(body.includes('My component!')).toBeTruthy();

        page.close();
      });
    });
  },
  timeout
);
