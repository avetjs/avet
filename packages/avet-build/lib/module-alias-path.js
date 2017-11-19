const path = require('path');

module.exports = (moduleName, dir) => {
  return path.resolve(dir, moduleName);
};
