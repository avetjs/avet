const moduleAlias = require('module-alias');

module.exports = {
  addAlias(...args) {
    return moduleAlias.addAlias.call(null, ...args);
  },
};
