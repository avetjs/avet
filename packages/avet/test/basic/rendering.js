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
  });
};
