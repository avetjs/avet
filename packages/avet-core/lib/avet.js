const moduleAlias = require('module-alias');
const { EggCore } = require('egg-core');

const AVET_LOADER = Symbol('AvetCore#loader');

class AvetCore extends EggCore {
  constructor(options = {}) {
    super(options);

    options.baseDir = options.baseDir || process.cwd();
    options.type = options.type || 'application';

    this._options = options;

    const Loader = this[AVET_LOADER];
    this.avetLoader = new Loader({
      baseDir: options.baseDir,
      app: this,
      plugins: options.plugins,
    });

    // Create aliases of directories and register custom module paths
    this.addAlias = moduleAlias.addAlias;
    this.addAliases = moduleAlias.addAliases;
    this.addPath = moduleAlias.addPath;
  }

  get config() {
    return this.avetLoader ? this.avetLoader.config : {};
  }

  get plugins() {
    return this.avetLoader ? this.avetLoader.plugins : {};
  }

  get extends() {
    return this.avetLoader ? this.avetLoader.extends : {};
  }

  get [AVET_LOADER]() {
    return require('./loader/avet_loader');
  }
}

module.exports = AvetCore;
