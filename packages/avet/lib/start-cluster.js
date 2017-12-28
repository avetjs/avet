const egg = require('./core/egg');
const path = require('path');

const { startCluster } = egg;
const EGG_PATH = path.dirname(__dirname);

module.exports = function(options, callback) {
  options = options || {};
  options.framework = EGG_PATH;
  startCluster(options, callback);
};
