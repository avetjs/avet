const egg = require('./lib/core/egg');

module.exports = exports = egg;

/**
 * build avet application
 */
exports.buildApp = require('./lib/build');
/**
 * Start avet application with cluster mode
 */
exports.startCluster = require('./lib/start-cluster');
exports.Application = require('./lib/application');
exports.Agent = require('./lib/agent');
exports.AppWorkerLoader = require('./lib/core/loader/app_worker_loader');
exports.AgentWorkerLoader = require('./lib/core/loader/agent_worker_loader');
