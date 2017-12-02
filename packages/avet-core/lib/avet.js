const fs = require('fs');
const assert = require('assert');
const is = require('is-type-of');
const moduleAlias = require('module-alias');
const KoaApplication = require('koa');
const co = require('co');
const utils = require('./utils');
const send = require('avet-server/lib/send');
const staticCache = require('koa-static-cache');

const debug = require('debug')('avet-core');

const AVET_LOADER = Symbol('AvetCore#loader');
const INIT_READY = Symbol('AvetCore#initReady');
const AVET_READY_TIMEOUT_ENV = Symbol('AvetCore#avetReadyTimeoutEnv');

class AvetCore extends KoaApplication {
  constructor(options = {}) {
    options.baseDir = options.baseDir || process.cwd();
    options.rootDir = options.rootDir || './';
    options.type = options.type || 'application';

    assert(
      typeof options.baseDir === 'string',
      'options.baseDir required, and must be a string'
    );
    assert(
      fs.existsSync(options.baseDir),
      `Directory ${options.baseDir} not exists`
    );
    assert(
      fs.statSync(options.baseDir).isDirectory(),
      `Directory ${options.baseDir} is not a directory`
    );

    super();

    const avetReadyTimeoutEnv = process.env.AVET_READY_TIMEOUT_ENV;
    this[AVET_READY_TIMEOUT_ENV] = Number.parseInt(
      avetReadyTimeoutEnv || 10000,
      10
    );

    this._options = options;

    const Loader = this[AVET_LOADER];
    this.loader = new Loader({
      baseDir: options.baseDir,
      rootDir: options.rootDir,
      app: this,
      plugins: options.plugins,
    });

    // Create aliases of directories and register custom module paths
    this.addAlias = moduleAlias.addAlias;
    this.addAliases = moduleAlias.addAliases;
    this.addPath = moduleAlias.addPath;

    this[INIT_READY]();
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
  use(fn) {
    assert(is.function(fn), 'app.use() requires a function');
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(utils.middleware(fn));
    return this;
  }

  staticCache(options) {
    // static cache
    return this.use(staticCache(options));
  }

  *serverStatic(ctx, path) {
    yield send(ctx, path);
  }

  /**
   * Execute scope after loaded and before app start
   *
   * @param  {Function|GeneratorFunction|AsyncFunction} scope function will execute before app start
   */
  beforeStart(scope) {
    if (!is.function(scope)) {
      throw new Error('beforeStart only support function');
    }

    // get filename from stack
    const name = utils.getCalleeFromStack(true);
    const done = this.readyCallback(name);

    // ensure scope executes after load completed
    process.nextTick(() => {
      co(function*() {
        yield utils.callFn(scope);
      }).then(() => done(), done);
    });
  }

  [INIT_READY]() {
    require('ready-callback')({ timeout: this[AVET_READY_TIMEOUT_ENV] }).mixin(
      this
    );

    this.on('ready_stat', data => {
      this.console.info(
        '[avet:core:ready_stat] end ready task %s, remain %j',
        data.id,
        data.remain
      );
    }).on('ready_timeout', id => {
      this.console.warn(
        '[avet:core:ready_timeout] %s seconds later %s was still unable to finish.',
        this[AVET_READY_TIMEOUT_ENV] / 1000,
        id
      );
    });

    this.ready(() => debug('avet emit ready, application started'));
  }

  get [AVET_LOADER]() {
    return require('./loader/avet_loader');
  }
}

module.exports = AvetCore;
