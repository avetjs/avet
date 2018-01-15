const { renderPage } = require('../utils');

module.exports = () => {
  describe('rendering', () => {
    it('renders a stateless component', async () => {
      const page = await renderPage('/stateless');
      const html = await page.evaluate(() => {
        return {
          head: document.head.innerHTML,
          body: document.body.textContent,
        };
      });

      expect(
        html.head.includes('<meta charset="utf-8" class="app-head">')
      ).toBeTruthy();
      expect(html.body.includes('My component!')).toBeTruthy();

      page.close();
    });

    it('renders a stateful component', async () => {
      const page = await renderPage('/stateful');
      const answer = await page.evaluate(() => {
        return document.getElementById('answer').textContent;
      });

      expect(answer).toEqual('The answer is 42');
      page.close();
    });

    it('header helper renders header information', async () => {
      const page = await renderPage('/head');
      const html = await page.evaluate(() => {
        return {
          head: document.head.innerHTML,
          body: document.body.textContent,
        };
      });

      expect(html.head).toContain(
        '<meta charset="iso-8859-5" class="app-head">'
      );
      expect(html.head).toContain('<meta content="my meta" class="app-head">');
      expect(html.body).toContain('I can haz meta tags');

      page.close();
    });

    it('header helper dedups tags', async () => {
      const page = await renderPage('/head');
      const html = await page.evaluate(() => {
        return {
          head: document.head.innerHTML,
          body: document.body.textContent,
        };
      });

      expect(html.head).toContain(
        '<meta charset="iso-8859-5" class="app-head">'
      );
      expect(html.head).not.toContain(
        '<meta charset="utf-8" class="app-head">'
      );
      expect(html.head).toContain('<meta content="my meta" class="app-head">');
      expect(html.head).toContain(
        '<link rel="stylesheet" href="/dup-style.css" class="app-head"><link rel="stylesheet" href="/dup-style.css" class="app-head">'
      );
      expect(html.head).toContain(
        '<link rel="stylesheet" href="dedupe-style.css" class="app-head">'
      );
      expect(html.head).not.toContain(
        '<link rel="stylesheet" href="dedupe-style.css" class="app-head"><link rel="stylesheet" href="dedupe-style.css" class="app-head">'
      );

      page.close();
    });

    it('header helper renders Fragment children', async () => {
      const page = await renderPage('/head');
      const html = await page.evaluate(() => {
        return {
          head: document.head.innerHTML,
          body: document.body.textContent,
        };
      });

      expect(html.head).toContain(
        '<title class="app-head">Fragment title</title>'
      );
      expect(html.head).toContain(
        '<meta content="meta fragment" class="app-head">'
      );

      page.close();
    });

    it('should render the page with custom extension', async () => {
      const page = await renderPage('/custom-extension');
      const html = await page.evaluate(() => {
        return {
          head: document.head.innerHTML,
          body: document.body.innerHTML,
        };
      });
      expect(html.body).toContain('<div>Hello</div>');
      expect(html.body).toContain('<div>World</div>');
      page.close();
    });

    it('renders styled jsx', async () => {
      const page = await renderPage('/styled-jsx');
      const { style, styleId } = await page.evaluate(() => {
        return {
          style: document.querySelector('style[data-styled-jsx]').innerHTML,
          styleId: document.querySelector('#blue-box').getAttribute('class'),
        };
      });

      expect(style).toContain(`p.${styleId}{color:blue`);
      page.close();
    });

    it('renders properties populated asynchronously', async () => {
      const page = await renderPage('/async-props');
      const html = await page.evaluate(() => {
        return {
          body: document.body.innerHTML,
        };
      });
      expect(html.body).toContain('Diego Milito');
      page.close();
    });

    it('renders a link component', async () => {
      const page = await renderPage('/link');
      const link = await page.evaluate(
        () => document.querySelector('a[href="/about"]').textContent
      );
      expect(link).toBe('About');
      page.close();
    });

    it('getInitialProps resolves to null', async () => {
      const page = await renderPage('/empty-get-initial-props');
      const text = await page.evaluate(() => document.body.textContent);
      const expectedErrorMessage =
        '"EmptyInitialPropsPage.getInitialProps()" should resolve to an object. But found "null" instead.';
      expect(text).toContain(expectedErrorMessage);
      page.close();
    });

    it('allows to import .json files', async () => {
      const page = await renderPage('/json');
      const body = await page.evaluate(() => document.body.textContent);
      expect(body).toContain('Zeit');
    });

    it('default export is not a React Component', async () => {
      const page = await renderPage('/no-default-export');
      const body = await page.evaluate(() => document.body.textContent);
      expect(body).toContain('The default export is not a React Component');
      page.close();
    });

    it('error', async () => {
      const page = await renderPage('/error');
      const body = await page.evaluate(() => document.body.textContent);
      expect(body).toContain('This is an expected error');
      page.close();
    });

    it('asPath', async () => {
      const page = await renderPage('/nav/as-path', { aa: 10 });
      const text = await page.evaluate(
        () => document.querySelector('.as-path-content').textContent
      );
      expect(text).toContain('/nav/as-path?aa=10');
      page.close();
    });

    it('error 404', async () => {
      const page = await renderPage('/non-existent');
      const { h1, h2 } = await page.evaluate(() => {
        return {
          h1: document.querySelector('h1').textContent,
          h2: document.querySelector('h2').textContent,
        };
      });
      expect(h1).toBe('404');
      expect(h2).toBe('This page could not be found.');
    });
  });
};
