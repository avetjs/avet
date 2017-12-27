const { AgentWorkerLoader } = require('../egg');
const createLoader = require('./create_loader');

class AvetAgentWorkerLoader extends createLoader(AgentWorkerLoader) {}

module.exports = AvetAgentWorkerLoader;
