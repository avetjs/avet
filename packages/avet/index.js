/**
 * build avet application
 */
exports.buildApp = require('./lib/build');

/**
 * Start avet application with cluster mode
 */
exports.startCluster = require('avet-cluster').startCluster;

/**
 * @member {Application} Avet#Application
 */
exports.Application = require('./lib/avet');

/**
 * @member {Agent} Avet#Agent
 */
exports.Agent = require('./lib/agent');
