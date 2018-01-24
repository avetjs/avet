const { join, relative, sep } = require('path');
const webpack = require('webpack');
const compose = require('koa-compose');
const { IS_BUNDLED_PAGE } = require('avet-utils');

const {
  WebpackDevMiddleware,
  WebpackHotMiddleware,
  createCompiler,
} = require('../../');

const clean = require('../clean');
const onDemandEntryHandler = require('./on-demand-entry-handler');

module.exports = class HotReloader {
  constructor(options) {
    this.dir = options.dir;
    this.dist = options.buildConfig.distDir;
    this.quiet = options.quiet;
    this.middlewares = [];
    this.webpackDevMiddleware = null;
    this.webpackHotMiddleware = null;
    this.initialized = false;
    this.stats = null;
    this.compilationErrors = null;
    this.prevAssets = null;
    this.prevChunkNames = null;
    this.prevFailedChunkNames = null;
    this.prevChunkHashes = null;

    this.buildConfig = options.buildConfig;
    this.appConfig = options.appConfig;
    this.layouts = options.layouts;
    this.plugins = options.plugins;
    this.avetPluginConfig = options.avetPluginConfig;

    this.run = this.run.bind(this);
  }

  async run(ctx, next) {
    await compose(this.middlewares)(ctx, next);
  }

  async start() {
    const [ compiler ] = await Promise.all([
      createCompiler(this.dir, {
        dev: true,
        quiet: this.quiet,
        avetPluginConfig: this.avetPluginConfig,
        buildConfig: this.buildConfig,
        appConfig: this.appConfig,
        layouts: this.layouts,
        plugins: this.plugins,
      }),
      clean(this.dir, this.dist),
    ]);

    const buildTools = await this.prepareBuildTools(compiler);
    this.assignBuildTools(buildTools);

    this.stats = await this.waitUntilValid();
  }

  async stop(webpackDevMiddleware) {
    const middleware = webpackDevMiddleware || this.webpackDevMiddleware;
    if (middleware) {
      return new Promise((resolve, reject) => {
        middleware.close(err => {
          if (err) return reject(err);
          resolve();
        });
      });
    }
  }

  async reload() {
    this.stats = null;

    const [ compiler ] = await Promise.all([
      createCompiler(this.dir, {
        dev: true,
        quiet: this.quiet,
        avetPluginConfig: this.avetPluginConfig,
        buildConfig: this.buildConfig,
        appConfig: this.appConfig,
        layouts: this.layouts,
        plugins: this.plugins,
      }),
      clean(this.dir, this.dist),
    ]);

    const buildTools = await this.prepareBuildTools(compiler);
    this.stats = await this.waitUntilValid(buildTools.webpackDevMiddleware);

    const oldWebpackDevMiddleware = this.webpackDevMiddleware;

    this.assignBuildTools(buildTools);
    await this.stop(oldWebpackDevMiddleware);
  }

  assignBuildTools({
    webpackDevMiddleware,
    webpackHotMiddleware,
    onDemandEntries,
  }) {
    this.webpackDevMiddleware = webpackDevMiddleware;
    this.webpackHotMiddleware = webpackHotMiddleware;
    this.onDemandEntries = onDemandEntries;
    this.middlewares = [
      webpackDevMiddleware,
      webpackHotMiddleware,
      onDemandEntries.middleware(),
    ];
  }

  async prepareBuildTools(compiler) {
    compiler.plugin('after-emit', (compilation, callback) => {
      const { assets } = compilation;

      if (this.prevAssets) {
        for (const f of Object.keys(assets)) {
          deleteCache(assets[f].existsAt);
        }
        for (const f of Object.keys(this.prevAssets)) {
          if (!assets[f]) {
            deleteCache(this.prevAssets[f].existsAt);
          }
        }
      }
      this.prevAssets = assets;

      callback();
    });

    compiler.plugin('done', stats => {
      const { compilation } = stats;
      const chunkNames = new Set(
        compilation.chunks
          .map(c => c.name)
          .filter(name => IS_BUNDLED_PAGE.test(name))
      );

      const failedChunkNames = new Set(
        compilation.errors
          .map(e => e.module.reasons)
          .reduce((a, b) => a.concat(b), [])
          .map(r => r.module.chunks)
          .reduce((a, b) => a.concat(b), [])
          .map(c => c.name)
      );

      const chunkHashes = new Map(
        compilation.chunks
          .filter(c => IS_BUNDLED_PAGE.test(c.name))
          .map(c => [ c.name, c.hash ])
      );

      if (this.initialized) {
        // detect chunks which have to be replaced with a new template
        // e.g, page/index.js <-> page/_error.js
        const added = diff(chunkNames, this.prevChunkNames);
        const removed = diff(this.prevChunkNames, chunkNames);
        const succeeded = diff(this.prevFailedChunkNames, failedChunkNames);

        // reload all failed chunks to replace the templace to the error ones,
        // and to update error content
        const failed = failedChunkNames;

        const rootDir = join('bundles', 'page');

        for (const n of new Set([
          ...added,
          ...removed,
          ...failed,
          ...succeeded,
        ])) {
          const route = toRoute(relative(rootDir, n));
          this.send('reload', route);
        }

        for (const [ n, hash ] of chunkHashes) {
          if (!this.prevChunkHashes.has(n)) continue;
          if (this.prevChunkHashes.get(n) === hash) continue;

          const route = toRoute(relative(rootDir, n));

          // notify change to recover from runtime errors
          this.send('change', route);
        }
      }

      this.initialized = true;
      this.stats = stats;
      this.compilationErrors = null;
      this.prevChunkNames = chunkNames;
      this.prevFailedChunkNames = failedChunkNames;
      this.prevChunkHashes = chunkHashes;
    });

    let webpackDevMiddlewareConfig = this.buildConfig.webpackDevMiddleware;
    let webpackHotMiddlewareConfig = this.buildConfig.webpackHotMiddleware;

    if (this.buildConfig._webpackDevMiddlewareFnList) {
      webpackDevMiddlewareConfig = await getAppWebpackDevMiddlewareConfig(
        this.buildConfig._webpackDevMiddlewareFnList,
        webpackDevMiddlewareConfig,
        this.appConfig
      );
    }

    if (this.buildConfig._webpackHotMiddlewareFnList) {
      webpackHotMiddlewareConfig = await getAppWebpackHotMiddlewareConfig(
        this.buildConfig._webpackHotMiddlewareFnList,
        webpackHotMiddlewareConfig,
        this.appConfig
      );
    }

    const webpackDevMiddleware = WebpackDevMiddleware(
      compiler,
      webpackDevMiddlewareConfig
    );

    const webpackHotMiddleware = WebpackHotMiddleware(
      compiler,
      webpackHotMiddlewareConfig
    );

    const onDemandEntries = onDemandEntryHandler(
      webpackDevMiddleware,
      compiler,
      Object.assign(
        {},
        {
          dir: this.dir,
          dev: true,
          reload: this.reload.bind(this),
        },
        this.buildConfig.onDemandEntries
      )
    );

    return {
      webpackDevMiddleware,
      webpackHotMiddleware,
      onDemandEntries,
    };
  }

  waitUntilValid(webpackDevMiddleware) {
    const middleware = webpackDevMiddleware || this.webpackDevMiddleware;
    return new Promise(resolve => {
      middleware.waitUntilValid(resolve);
    });
  }

  async getCompilationErrors() {
    // When we are reloading, we need to wait until it's reloaded properly.
    if (this.buildConfig.hotReload) {
      await this.onDemandEntries.waitUntilReloaded();
    }

    if (!this.compilationErrors) {
      this.compilationErrors = new Map();

      if (this.stats.hasErrors()) {
        const { compiler, errors } = this.stats.compilation;

        for (const err of errors) {
          for (const r of err.module.reasons) {
            for (const c of r.module.chunks) {
              // get the path of the bundle file
              const path = join(compiler.outputPath, c.name);
              const errors = this.compilationErrors.get(path) || [];
              this.compilationErrors.set(path, errors.concat([ err ]));
            }
          }
        }
      }
    }

    return this.compilationErrors;
  }

  send(action, ...args) {
    if (this.buildConfig.hotReload) {
      this.webpackHotMiddleware.publish({ action, data: args });
    }
  }

  ensurePage(page) {
    return this.onDemandEntries.ensurePage(page);
  }
};

function deleteCache(path) {
  delete require.cache[path];
}

function diff(a, b) {
  return new Set([ ...a ].filter(v => !b.has(v)));
}

function toRoute(file) {
  const f = sep === '\\' ? file.replace(/\\/g, '/') : file;
  return `/${f}`.replace(/(\/index)?\.js$/, '') || '/';
}

async function getAppWebpackDevMiddlewareConfig(
  webpackDevMiddlewareFnList,
  webpackDevMiddlewareConfig,
  appConfig
) {
  let ret = webpackDevMiddlewareConfig;

  if (Array.isArray(webpackDevMiddlewareFnList)) {
    for (const fn of webpackDevMiddlewareFnList) {
      ret = await fn(ret, appConfig, webpack);
    }
  }

  return ret;
}

async function getAppWebpackHotMiddlewareConfig(
  webpackHotMiddlewareFnList,
  webpackHotMiddlewareConfig,
  appConfig
) {
  let ret = webpackHotMiddlewareConfig;

  if (Array.isArray(webpackHotMiddlewareFnList)) {
    for (const fn of webpackHotMiddlewareFnList) {
      ret = await fn(ret, appConfig, webpack);
    }
  }

  return ret;
}
