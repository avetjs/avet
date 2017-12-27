const moduleAlias = require('module-alias');
const EggApplication = require('./egg').Application;

class Application extends EggApplication {
  constructor(options) {
    super(options);

    // Create aliases of directories and register custom module paths
    this.addAlias = moduleAlias.addAlias;
    this.addAliases = moduleAlias.addAliases;
    this.addPath = moduleAlias.addPath;
  }

  get layouts() {
    return this.loader ? this.loader.layouts : {};
  }
}

module.exports = Application;
