module.exports = class HotReloader {
  constructor(app) {
    this.app = app;
  }

  stop() {
    this.app.messenger.sendToAgent('event_hotreloader_stop');
  }

  async ensurePage(page) {}
};
