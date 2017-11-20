const { existsSync, readdirSync } = require('fs');
const { join } = require('path');

module.exports = {
  IS_BUNDLED_PAGE: /^bundles[/\\]page.*\.js$/,
  MATCH_ROUTE_NAME: /^bundles[/\\]page[/\\](.*)\.js$/,

  getAvailableChunks: distDir => {
    const chunksDir = join(distDir, 'chunks');
    if (!existsSync(chunksDir)) return {};

    const chunksMap = {};
    const chunkFiles = readdirSync(chunksDir);

    chunkFiles.forEach(filename => {
      if (/\.js$/.test(filename)) {
        chunksMap[filename] = true;
      }
    });

    return chunksMap;
  },
};
