'use strict';

const path = require('path');
const AvetCore = require('avet-core').AvetCore;

const AVET_PATH = Symbol.for('avet#avetPath');

class Application extends AvetCore {
  constructor(options) {
    super(options);

    try {
      this.loader.loadPlugin();
      this.loader.loadConfig();
      this.loader.loadCustomApp();
      this.loader.loadExtend();
    } catch (e) {
      throw e;
    }

    // this.hasInit = false;

    // Listen the error that promise had not catch, then log it in common-error
    this._unhandledRejectionHandler = this._unhandledRejectionHandler.bind(this);
    process.on('unhandledRejection', this._unhandledRejectionHandler);
  }

  // * _initApp() {
  //   if (this.hasInit) return null;

  //   await generatePluginInfomation(
  //     this.config.server.dir,
  //     this.config.build.distDir,
  //     this.extends
  //   );

  //   this.hasInit = true;
  // }
  // }

  get [AVET_PATH]() {
    return path.join(__dirname, '..');
  }

  _unhandledRejectionHandler(err) {
    if (!(err instanceof Error)) {
      const newError = new Error(String(err));
      // err maybe an object, try to copy the name, message and stack to the new error instance
      /* istanbul ignore else */
      if (err) {
        if (err.name) newError.name = err.name;
        if (err.message) newError.message = err.message;
        if (err.stack) newError.stack = err.stack;
      }
      err = newError;
    }
    /* istanbul ignore else */
    if (err.name === 'Error') {
      err.name = 'unhandledRejectionError';
    }

    throw new Error(err.stack);
  }
}

module.exports = Application;
