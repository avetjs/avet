const HotReloader = require('./hot-reloader');
const Koa = require('koa');
const cors = require('@koa/cors');

module.exports = class HotReloaderAgentServer {
  constructor(app, options) {
    this.eggApplication = app;
    this.hotReloader = new HotReloader(options);

    app.messenger.on('event_hotreloader_stop', async () => {
      await this.hotReloader.stop();
    });

    app.messenger.on('event_hotreloader_ensure_page', async data => {
      const result = {
        status: 1,
        trace_id: data.trace_id,
      };

      try {
        await this.hotReloader.onDemandEntries.ensurePage(data.page);
      } catch (error) {
        result.error = error;
      }

      const compilationError = await this.getCompilationError();
      if (compilationError) {
        result.compilationError = compilationError;
      }

      app.messenger.sendToApp('event_hotreloader_ensure_page_success', result);
    });

    this.prepare().then(() => {
      this.startServer();
    });
  }

  async prepare() {
    await this.hotReloader.start();
  }

  startServer() {
    this.app = new Koa();

    this.app.use(cors());
    this.app.use(this.hotReloader.run);

    const { port } = this.eggApplication.config.build.devServer;
    this.app.listen(port, () => {
      this.eggApplication.logger.info(
        `hot reloader devServer started at port ${port}`
      );
    });
  }

  async getCompilationError() {
    if (!this.hotReloader) return;

    const errors = await this.hotReloader.getCompilationErrors();
    if (!errors.size) return;

    // Return the very first error we found.
    return Array.from(errors.values())[0][0];
  }
};
