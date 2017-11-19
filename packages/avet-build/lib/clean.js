const { resolve } = require('path');
const del = require('del');

module.exports = function clean(dir, distDir) {
  return del(resolve(dir, distDir));
};
