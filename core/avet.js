import * as fs from 'fs';
import * as path from 'path';
import assert from 'assert';
import Server from './server/avet';

const debug = require('debug')('avet:avet');
const AVET_LOADER = Symbol('avet#loader');

export default class AvetCore {
  constructor(options = {}) {
    options.baseDir = options.baseDir || process.cwd();
    options.type = options.type || 'application';

    assert(typeof options.baseDir === 'string', 'options.baseDir required, and must be a string');
    assert(fs.existsSync(options.baseDir), `Directory ${options.baseDir} not exists`);
    assert(fs.statSync(options.baseDir).isDirectory(), `Directory ${options.baseDir} is not a directory`);

    this._options = options;
    this.middlewares = [];

    const Loader = this[AVET_LOADER];
    this.loader = new Loader({
      baseDir: options.baseDir,
      app: this,
      plugins: options.plugins,
    });

    // Listen the error that promise had not catch, then log it in common-error
    this._unhandledRejectionHandler = this._unhandledRejectionHandler.bind(this);
    process.on('unhandledRejection', this._unhandledRejectionHandler);
  }

  get baseDir() {
    return this._options.baseDir;
  }

  get name() {
    return this.loader ? this.loader.pkg.name : '';
  }

  get plugins() {
    return this.loader ? this.loader.plugins : {};
  }

  get config() {
    return this.loader ? this.loader.config : {};
  }

  get extends() {
    return this.loader ? this.loader.extends : {};
  }

  /**
   * before the server start
   *
   * @memberof AvetCore
   */
  serverUse(fn) {
    if (typeof fn !== 'function') throw new Error('params must be a function!');

    debug('serverUse: ', fn._name || fn.name || '-');
    this.middlewares.push(fn);

    return this;
  }

  serverStatic = async (req, res, filePath) => {
    if (!this.server) throw new Error('server must be started!');
    return await this.server.serveStatic(req, res, filePath);
  }

  serverHandle(req, res, parsedUrl) {
    if (!this.server) return;
    const handle = this.server.getRequestHandler();
    handle(req, res, parsedUrl);
  }

  startServer() {
    const serverConfig = this.config.server;
    const buildConfig = this.config.build;

    this.server = new Server(
      serverConfig,
      buildConfig,
      this.extends,
      this.middlewares,
    );

    this.server.start(serverConfig.port).then(() => {
      if (!process.env.NOW) {
        console.log(`> Ready on http://localhost:${serverConfig.port}`);
      }
    });
  }

  get [AVET_LOADER]() {
    return require('./loader').default;
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

