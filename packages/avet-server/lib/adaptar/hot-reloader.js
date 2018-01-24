module.exports = class HotReloader {
  constructor(app) {
    this.app = app;
    this.timeout = 10000;
    this.pages = new Map();

    this.app.messenger.on('event_hotreloader_ensure_page_success', data => {
      this.pages.set(data.trace_id, data);
    });
  }

  stop() {
    this.app.messenger.sendToAgent('event_hotreloader_stop');
  }

  async ensurePage(page) {
    return new Promise(resolve => {
      const trace_id = +new Date();
      this.app.messenger.sendToAgent('event_hotreloader_ensure_page', {
        page,
        trace_id,
      });

      const t1 = new Date();
      let timer = setInterval(() => {
        const data = this.pages.get(trace_id);
        if (data) {
          resolve(data);
          this.pages.delete(trace_id);
          clearInterval(timer);
          timer = null;
        }
        if (new Date() - t1 > this.timeout) {
          clearInterval(timer);
          timer = null;
        }
      }, 2000);
    });
  }
};
