const { AgentWorkerLoader } = require('egg');
const createLoader = require('./create_loader');

module.exports = createLoader(AgentWorkerLoader);
