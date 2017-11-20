const Master = require('./lib/master');

/**
 * start avet app
 * @method Egg#startCluster
 * @param {Object} options {@link Master}
 * @param {Function} callback start success callback
 */
exports.startCluster = function(options, callback) {
  new Master(options).ready(callback);
};
