const { renderPage } = require('../utils');

module.exports = () => {
  describe('Dynamic import', () => {
    describe('with SSR', () => {
      it('should render dynmaic import components', async () => {
        const page = await renderPage('/dynamic/ssr');
        const text = await page.evaluate(
          () => document.querySelector('p').textContent
        );
        expect(text).toBe('Hello World 1');
        page.close();
      });

      it('should stop render dynmaic import components', async () => {
        const page = await renderPage('/dynamic/no-ssr');
        const text = await page.evaluate(
          () => document.querySelector('p').textContent
        );
        expect(text).toBe('loading...');
        page.close();
      });

      it('should stop render dynmaic import components with custom loading', async () => {
        const page = await renderPage('/dynamic/no-ssr-custom-loading');
        const text = await page.evaluate(
          () => document.querySelector('p').textContent
        );
        expect(text).toBe('LOADING');
        page.close();
      });

      it('should render dynamic imports bundle', async () => {
        const page = await renderPage('/dynamic/bundle');
        const bodyText = await page.evaluate(() => document.body.textContent);
        expect(bodyText).toContain('Dynamic Bundle');
        expect(bodyText).toContain('Hello World 1');
        expect(bodyText).not.toContain('Hello World 2');
        page.close();
      });
    });
  });
};
