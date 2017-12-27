const egg = require('egg');

const framework = {};
/**
 * build avet application
 */
framework.buildApp = require('./lib/build');
/**
 * Start avet application with cluster mode
 */
framework.startCluster = require('avet-cluster').startCluster;
framework.Application = require('./lib/application');
framework.Agent = require('./lib/agent');
framework.AppWorkerLoader = require('./lib/core/loader/app_worker_loader');
framework.AgentWorkerLoader = require('./lib/core/loader/agent_worker_loader');

module.exports = exports = Object.assign(egg, framework);
