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
    });
  });
};
