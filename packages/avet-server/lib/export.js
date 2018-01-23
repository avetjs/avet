const del = require('del');
const cp = require('recursive-copy');
const mkdirp = require('mkdirp-then');
const walk = require('walk');
const { resolve, join, dirname, sep } = require('path');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { renderToHTML } = require('./render');
const { getAvailableChunks, printAndExit } = require('avet-utils');

module.exports = async function(dir, options) {
  dir = resolve(dir);
  const avetDir = join(dir, options.distDir);

  log(`  using build directory: ${avetDir}`);

  if (!existsSync(avetDir)) {
    console.error(
      `Build directory ${avetDir} does not exist. Make sure you run "avet build" before running "avet start" or "avet export".`
    );
    process.exit(1);
  }

  const buildId = readFileSync(join(avetDir, 'BUILD_ID'), 'utf8');
  const buildStats = require(join(avetDir, 'build-stats.json'));

  // Initialize the output directory
  const outDir = options.outdir;
  await del(join(outDir, '*'));
  await mkdirp(join(outDir, '_app', buildStats['app.js'].hash));
  await mkdirp(join(outDir, '_app', buildId));

  // Copy files
  await cp(
    join(avetDir, 'app.js'),
    join(outDir, '_app', buildStats['app.js'].hash, 'app.js')
  );

  // Copy static directory
  if (existsSync(join(dir, 'static'))) {
    log('  copying "static" directory');
    await cp(join(dir, 'static'), join(outDir, 'static'));
  }

  // Copy dynamic import chunks
  if (existsSync(join(avetDir, 'chunks'))) {
    log('  copying dynamic import chunks');

    await mkdirp(join(outDir, '_app', 'webpack'));
    await cp(
      join(avetDir, 'chunks'),
      join(outDir, '_app', 'webpack', 'chunks')
    );
  }

  await copyPages(avetDir, outDir, buildId);

  // Get the exportPathMap = require(the `avet.config.js`
  if (typeof options.buildConfig.exportPathMap !== 'function') {
    printAndExit(
      '> Could not found "exportPathMap" function in config \n' +
        '> "avet export" uses that function build html pages.'
    );
  }

  const exportPathMap = await options.buildConfig.exportPathMap();
  const exportPaths = Object.keys(exportPathMap);

  // Start the rendering process
  const renderOpts = {
    dir,
    buildStats,
    buildId,
    avetExport: true,
    assetPrefix: options.buildConfig.assetPrefix.replace(/\/$/, ''),
    dev: false,
    staticMarkup: false,
    hotReloader: null,
    availableChunks: getAvailableChunks(dir, options.buildConfig.distDir),
  };

  // We need this for server rendering the Link component.
  global.__APP_DATA__ = {
    avetExport: true,
  };

  for (const path of exportPaths) {
    log(`  exporting path: ${path}`);

    const { page, query = {} } = exportPathMap[path];
    const req = { url: path };
    const res = {};

    const htmlFilename =
      path === '/' ? 'index.html' : `${path}${sep}index.html`;
    const baseDir = join(outDir, dirname(htmlFilename));
    const htmlFilepath = join(outDir, htmlFilename);

    await mkdirp(baseDir);

    const html = await renderToHTML(req, res, page, query, renderOpts);
    writeFileSync(htmlFilepath, html, 'utf8');
  }

  // Add an empty line to the console for the better readability.
  log('');

  function log(message) {
    if (options.silent) return;
    console.log(message);
  }
};

function copyPages(avetDir, outDir, buildId) {
  // TODO: do some proper error handling
  return new Promise((resolve, reject) => {
    const avetBundlesDir = join(avetDir, 'bundles', 'page');
    const walker = walk.walk(avetBundlesDir, { followLinks: false });

    walker.on('file', (root, stat, next) => {
      const filename = stat.name;
      const fullFilePath = `${root}${sep}${filename}`;
      const relativeFilePath = fullFilePath.replace(avetBundlesDir, '');

      // We should not expose this page to the client side since
      // it has no use in the client side.
      if (relativeFilePath === '/_document.js') {
        next();
        return;
      }

      let destFilePath = null;
      if (/index\.js$/.test(filename)) {
        destFilePath = join(outDir, '_app', buildId, 'page', relativeFilePath);
      } else {
        const newRelativeFilePath = relativeFilePath.replace(
          /\.js/,
          `${sep}index.js`
        );
        destFilePath = join(
          outDir,
          '_app',
          buildId,
          'page',
          newRelativeFilePath
        );
      }

      cp(fullFilePath, destFilePath)
        .then(next)
        .catch(reject);
    });

    walker.on('end', resolve);
  });
}
