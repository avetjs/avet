const HotReloader = require('./hot-reloader');
const Koa = require('koa');

module.exports = class HotReloaderAgentServer {
  constructor(eggApplication, options) {
    this.eggApplication = eggApplication;
    this.hotReloader = new HotReloader(options);

    eggApplication.messenger.on('event_hotreloader_stop', async () => {
      await this.hotReloader.stop();
    });

    eggApplication.messenger.on('event_hotreloader_ensure_page', async data => {
      await this.hotReloader.onDemandEntries.ensurePage(data.page);
      eggApplication.messenger.sendToApp(
        'event_hotreloader_ensure_page_success',
        {
          status: 1,
          trace_id: data.trace_id,
        }
      );
    });

    this.prepare().startServer();
  }

  async prepare() {
    await this.hotReloader.start();
    return this;
  }

  startServer() {
    this.app = new Koa();

    this.app.use(this.hotReloader.run);

    this.app.listen(this.eggApplication.config.build.devServer.port, () => {
      this.eggApplication.logger.info('Hot Reloader devServer Started.');
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
