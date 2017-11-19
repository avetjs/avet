// const { tmpdir } = require('os');
const { join } = require('path');
const fs = require('mz/fs');
const uuid = require('uuid');
const del = require('del');
const md5File = require('md5-file/promise');
// const replaceCurrentBuild = require('./replace');
const createCompiler = require('./createCompiler');

module.exports = async function build(dir, options) {
  const { distDir } = options.buildConfig;

  // remove pre distdir.
  del(join(dir, distDir), { force: true });

  const compiler = await createCompiler(dir, options);

  try {
    await runCompiler(compiler);
    await writeBuildStats(dir, distDir);
    await writeBuildId(dir, distDir);
  } catch (err) {
    console.error(`> Failed to build on ${distDir}`);
    throw err;
  }
  // await replaceCurrentBuild(dir, distDir);
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

async function writeBuildStats(dir, distDir) {
  // Here we can't use hashes in webpack chunks.
  // That's because the "app.js" is not tied to a chunk.
  // It's created by merging a few assets. (commons.js and main.js)
  // So, we need to generate the hash ourself.
  const assetHashMap = {
    'app.js': {
      hash: await md5File(join(dir, distDir, 'app.js')),
    },
  };

  const buildStatsPath = join(dir, distDir, 'build-stats.json');
  await fs.writeFile(buildStatsPath, JSON.stringify(assetHashMap), 'utf8');
}

async function writeBuildId(dir, distDir) {
  const buildIdPath = join(dir, distDir, 'BUILD_ID');
  const buildId = uuid.v4();
  await fs.writeFile(buildIdPath, buildId, 'utf8');
}
