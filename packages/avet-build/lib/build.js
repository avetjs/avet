// const { tmpdir } = require('os');
const { join } = require('path');
const fs = require('mz/fs');
const uuid = require('uuid');
const del = require('del');
const md5File = require('md5-file/promise');
const createCompiler = require('./compiler');

module.exports = async function build(dir, options) {
  const { distDir, buildId } = options.buildConfig;
  const dist = join(dir, distDir);
  // remove pre distdir.
  del(dist, { force: true });

  console.log('> Build project ing...');

  const compiler = await createCompiler(dir, options);

  try {
    await runCompiler(compiler);
    await writeBuildStats(dist);
    await writeBuildId(dist, buildId);
  } catch (err) {
    console.error(`> Failed to build on ${dist}`);
    throw err;
  }

  console.log('> Build project done.');
};

function runCompiler(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err);

      const jsonStats = stats.toJson();

      if (jsonStats.errors.length > 0) {
        const error = new Error(jsonStats.errors[0]);
        error.errors = jsonStats.errors;
        error.warnings = jsonStats.warnings;
        return reject(error);
      }

      resolve(jsonStats);
    });
  });
}

async function writeBuildStats(dist) {
  // Here we can't use hashes in webpack chunks.
  // That's because the "app.js" is not tied to a chunk.
  // It's created by merging a few assets. (commons.js and main.js)
  // So, we need to generate the hash ourself.
  const assetHashMap = {
    'app.js': {
      hash: await md5File(join(dist, 'app.js')),
    },
  };

  const buildStatsPath = join(dist, 'build-stats.json');
  await fs.writeFile(buildStatsPath, JSON.stringify(assetHashMap), 'utf8');
}

async function writeBuildId(dist, buildId) {
  const buildIdPath = join(dist, 'BUILD_ID');
  const _buildId = buildId || uuid.v4();
  await fs.writeFile(buildIdPath, _buildId, 'utf8');
}
