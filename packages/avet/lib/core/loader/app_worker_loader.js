const { AppWorkerLoader } = require('../egg');
const createLoader = require('./create_loader');

module.exports = createLoader(AppWorkerLoader);
