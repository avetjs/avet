const { resolve, join, sep } = require('path');
const { readFileSync } = require('fs');
const { STATUS_CODES } = require('http');
const Router = require('./router');

const {
  renderToHTML,
  renderErrorToHTML,
  sendHTML,
  serveStatic,
  renderScript,
  renderScriptError,
} = require('./render');

const { getAvailableChunks } = require('avet-utils');

const internalPrefixes = [ /^\/_app\//, /^\/static\// ];

const blockedPages = {
  '/_document': true,
  '/_error': true,
};

class Server {
  constructor(options) {
    this.dev = options.dev;

    this.config = options;
    this.buildConfig = options.buildConfig;

    this.dir = options.dir;
    this.dist = this.buildConfig.distDir;

    this.router = new Router();
    this.hotReloader = this.dev ? this.getHotReloader(options) : null;

    this.buildStats = !this.dev
      ? require(join(this.dir, this.dist, 'build-stats.json'))
      : null;
    this.buildId = !this.dev ? this.readBuildId() : '-';

    this.renderOpts = {
      dev: this.dev,
      dir: this.dir,
      dist: this.dist,
      hotReloader: this.hotReloader,
      staticMarkup: options.staticMarkup,
      buildStats: this.buildStats,
      buildId: this.buildId,
      assetPrefix: this.buildConfig.assetPrefix.replace(/\/$/, ''),
      availableChunks: this.dev ? {} : getAvailableChunks(this.dir, this.dist),
    };

    this.defineRoutes();
  }

  getHotReloader(options) {
    const HotReloader = require('./hot-reloader');
    return new HotReloader(options);
  }

  async prepare() {
    if (this.hotReloader) {
      await this.hotReloader.start();
    }
  }

  async close() {
    if (this.hotReloader) {
      await this.hotReloader.stop();
    }
  }

  defineRoutes() {
    const routes = {
      // This is to support, webpack dynamic imports in production.
      '/_app/webpack/chunks/:name': async (ctx, params) => {
        ctx.set('cache-control', 'max-age=365000000, immutable');
        const p = join(this.dir, this.dist, 'chunks', params.name);
        await this.serveStatic(ctx, p);
      },

      // This is to support, webpack dynamic import support with HMR
      '/_app/webpack/:id': async (ctx, params) => {
        const p = join(this.dir, this.dist, 'chunks', params.id);
        await this.serveStatic(ctx, p);
      },

      '/_app/:hash/manifest.js': async (ctx, params) => {
        if (!this.dev) return this.send404(ctx);

        this.handleBuildHash('manifest.js', params.hash, ctx);
        const p = join(this.dir, this.dist, 'manifest.js');
        await this.serveStatic(ctx, p);
      },

      '/_app/:hash/main.js': async (ctx, params) => {
        if (!this.dev) return this.send404(ctx);

        this.handleBuildHash('main.js', params.hash, ctx);
        const p = join(this.dir, this.dist, 'main.js');
        await this.serveStatic(ctx, p);
      },

      '/_app/:hash/commons.js': async (ctx, params) => {
        if (!this.dev) return this.send404(ctx);

        this.handleBuildHash('commons.js', params.hash, ctx);
        const p = join(this.dir, this.dist, 'commons.js');

        await this.serveStatic(ctx, p);
      },

      '/_app/:hash/app.js': async (ctx, params) => {
        if (this.dev) return this.send404(ctx);

        this.handleBuildHash('app.js', params.hash, ctx);
        const p = join(this.dir, this.dist, 'app.js');
        await this.serveStatic(ctx, p);
      },

      '/_app/:buildId/page/_error*': async (ctx, params) => {
        if (!this.handleBuildId(params.buildId, ctx.response)) {
          const error = new Error('INVALID_BUILD_ID');
          const customFields = { buildIdMismatched: true };

          await renderScriptError(
            ctx,
            '/_error',
            error,
            customFields,
            this.renderOpts
          );
          return;
        }
        const p = join(this.dir, this.dist, 'bundles/page/_error.js');
        await this.serveStatic(ctx, p);
      },

      '/_app/:buildId/page/:path*': async (ctx, params) => {
        const paths = params.path || [ '' ];
        const page = `/${paths.join('/')}`;

        if (!this.handleBuildId(params.buildId, ctx)) {
          const error = new Error('INVALID_BUILD_ID');
          const customFields = { buildIdMismatched: true };

          await renderScriptError(
            ctx,
            page,
            error,
            customFields,
            this.renderOpts
          );

          return;
        }

        if (this.dev) {
          try {
            await this.hotReloader.ensurePage(page);
          } catch (error) {
            await renderScriptError(ctx, page, error, {}, this.renderOpts);

            return;
          }

          const compilationErr = await this.getCompilationError();
          if (compilationErr) {
            const customFields = { statusCode: 500 };
            await renderScriptError(
              ctx,
              page,
              compilationErr,
              customFields,
              this.renderOpts
            );
            return;
          }
        }

        await renderScript(ctx, page, this.renderOpts);
      },

      '/static/:path*': async (ctx, params) => {
        const p = join(this.dir, 'static', ...(params.path || []));
        await this.serveStatic(ctx, p);
      },
    };

    if (this.config.useFileSystemPublicRoutes) {
      routes['/:path*'] = async ctx => {
        await this.render(ctx);
      };
    }

    for (const method of [ 'GET', 'HEAD' ]) {
      for (const p of Object.keys(routes)) {
        this.router.add(method, p, routes[p]);
      }
    }
  }

  async serveStatic(ctx, path) {
    if (!this.isServeableUrl(path)) {
      return this.render404(ctx);
    }

    try {
      return await serveStatic(ctx, path);
    } catch (err) {
      if (err.code === 'ENOENT') {
        this.render404(ctx);
      } else {
        throw err;
      }
    }
  }

  async run(ctx, next) {
    if (this.hotReloader) {
      await this.hotReloader.run(ctx, next);
    }

    if (ctx.body) {
      return;
    }

    const fn = this.router.match(ctx);
    if (fn) {
      await fn();
      return;
    }

    if (ctx.method === 'GET' || ctx.method === 'HEAD') {
      await this.render404(ctx);
    } else {
      const code = 501;
      ctx.status = code;
      ctx.body = STATUS_CODES[code];
    }
  }

  async render(ctx) {
    if (this.isInternalUrl(ctx)) {
      return this.handleRequest(ctx);
    }

    if (blockedPages[ctx.path]) {
      await this.render404(ctx);
      return;
    }

    const html = await this.renderToHTML(ctx);
    return sendHTML(ctx, html, this.renderOpts);
  }

  async renderToHTML(ctx) {
    if (this.dev) {
      const compilationErr = await this.getCompilationError();
      if (compilationErr) {
        ctx.status = 500;
        return this.renderErrorToHTML(compilationErr, ctx);
      }
    }

    try {
      return await renderToHTML(ctx, this.renderOpts);
    } catch (err) {
      if (err.code === 'ENOENT') {
        ctx.status = 404;
        return this.renderErrorToHTML(null, ctx);
      }
      if (!this.quiet) console.error(err);
      ctx.status = 500;
      return this.renderErrorToHTML(err, ctx);
    }
  }

  async renderError(err, ctx) {
    const html = await this.renderErrorToHTML(err, ctx);
    return sendHTML(ctx, html, this.renderOpts);
  }

  async renderErrorToHTML(err, ctx) {
    if (this.dev) {
      const compilationErr = await this.getCompilationError();
      if (compilationErr) {
        ctx.status = 500;
        return renderErrorToHTML(compilationErr, ctx, this.renderOpts);
      }
    }

    try {
      return await renderErrorToHTML(err, ctx, this.renderOpts);
    } catch (err2) {
      if (this.dev) {
        if (!this.quiet) console.error(err2);
        ctx.status = 500;
        return renderErrorToHTML(err2, ctx, this.renderOpts);
      }
      throw err2;
    }
  }

  async render404(ctx) {
    ctx.status = 404;
    return this.renderError(null, ctx);
  }

  // Check url is serveable.
  isServeableUrl(url) {
    const resolved = resolve(url);
    if (
      resolved.indexOf(join(this.dir, this.dist) + sep) !== 0 &&
      resolved.indexOf(join(this.dir, 'static') + sep) !== 0
    ) {
      // Seems like the user is trying to traverse the filesystem.
      return false;
    }

    return true;
  }

  // Check url is internal.
  isInternalUrl(url) {
    for (const prefix of internalPrefixes) {
      if (prefix.test(url)) {
        return true;
      }
    }

    return false;
  }

  readBuildId() {
    const buildIdPath = join(this.dir, this.dist, 'BUILD_ID');
    const buildId = readFileSync(buildIdPath, 'utf8');
    return buildId.trim();
  }

  handleBuildId(buildId, ctx) {
    if (this.dev) return true;
    if (buildId !== this.renderOpts.buildId) {
      return false;
    }

    ctx.set('Cache-Control', 'max-age=365000000, immutable');
    return true;
  }

  async getCompilationError() {
    if (!this.hotReloader) return;

    const errors = await this.hotReloader.getCompilationErrors();
    if (!errors.size) return;

    // Return the very first error we found.
    return Array.from(errors.values())[0][0];
  }

  handleBuildHash(filename, hash, ctx) {
    if (this.dev) return;

    if (hash !== this.buildStats[filename].hash) {
      throw new Error(
        `Invalid Build File Hash(${hash}) for chunk: ${filename}`
      );
    }

    ctx.set('Cache-Control', 'max-age=365000000, immutable');
  }

  send404(ctx) {
    ctx.status = 404;
    ctx.body = '404 - Not Found';
  }
}

module.exports = Server;
