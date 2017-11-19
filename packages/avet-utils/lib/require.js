'use strict';

const { resolvePath } = require('./resolve');

async function requireModule(path) {
  const f = await resolvePath(path);
  return require(f);
}

module.exports = {
  requireModule,
};
