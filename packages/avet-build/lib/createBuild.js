// const { tmpdir } = require('os');
const { join } = require('path');
const fs = require('mz/fs');
const uuid = require('uuid');
const del = require('del');
const md5File = require('md5-file/promise');
// const replaceCurrentBuild = require('./replace');
const createCompiler = require('./createCompiler');

module.exports = async function build(dir, options) {
  const { rootDir } = options;
  const { distDir } = options.buildConfig;
  const dist = join(dir, rootDir, distDir);
  const root = join(dir, rootDir);
  // remove pre distdir.
  del(dist, { force: true });

  console.log('build ing...');

  const compiler = await createCompiler(root, options);

  try {
    await runCompiler(compiler);
    await writeBuildStats(dist);
    await writeBuildId(dist);
  } catch (err) {
    console.error(`> Failed to build on ${dist}`);
    throw err;
  }

  console.log('build done.');
  process.exit(0);
  // await replaceCurrentBuild(dir, dist);
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

async function writeBuildId(dist) {
  const buildIdPath = join(dist, 'BUILD_ID');
  const buildId = uuid.v4();
  await fs.writeFile(buildIdPath, buildId, 'utf8');
}
