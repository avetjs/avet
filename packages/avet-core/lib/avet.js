const moduleAlias = require('module-alias');
const { EggCore } = require('egg-core');

const AVET_LOADER = Symbol('avet#loader');

class AvetCore extends EggCore {
  constructor(options = {}) {
    super(options);

    options.baseDir = options.baseDir || process.cwd();
    options.type = options.type || 'application';

    const Loader = this[AVET_LOADER];

    this.loader = new Loader({
      baseDir: options.baseDir,
      app: this,
      plugins: options.plugins,
      logger: this.console,
      serverScope: options.serverScope,
    });

    // Create aliases of directories and register custom module paths
    this.addAlias = moduleAlias.addAlias;
    this.addAliases = moduleAlias.addAliases;
    this.addPath = moduleAlias.addPath;
  }

  get config() {
    return this.loader ? this.loader.config : {};
  }

  get plugins() {
    return this.loader ? this.loader.plugins : {};
  }

  get layoutExtends() {
    return this.loader ? this.loader.layoutExtends : {};
  }

  get [AVET_LOADER]() {
    return require('./loader/avet_loader');
  }
}

module.exports = AvetCore;
