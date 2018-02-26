const { join } = require('path');
const { EventEmitter } = require('events');
const DynamicEntryPlugin = require('webpack/lib/DynamicEntryPlugin');
const touch = require('touch');
const debounce = require('debounce');
const {
  resolvePath,
  MATCH_ROUTE_NAME,
  IS_BUNDLED_PAGE,
} = require('avet-utils');

const ADDED = 'symbol_added';
const BUILDING = 'symbol_building';
const BUILT = 'symbol_built';

const reloadWorker = debounce(() => {
  process.send({
    to: 'master',
    action: 'reload-worker',
  });
}, 200);

// Make sure only one invalidation happens at a time
// Otherwise, webpack hash gets changed and it'll force the client to reload.
class Invalidator {
  constructor(devMiddleware) {
    this.devMiddleware = devMiddleware;
    this.building = false;
    this.rebuildAgain = false;
  }

  invalidate() {
    // If there's a current build is processing, we won't abort it by invalidating.
    // (If aborted, it'll cause a client side hard reload)
    // But let it to invalidate just after the completion.
    // So, it can re-build the queued pages at once.
    if (this.building) {
      this.rebuildAgain = true;
      return;
    }

    this.building = true;
    this.devMiddleware.invalidate();
  }

  startBuilding() {
    this.building = true;
  }

  doneBuilding() {
    this.building = false;
    if (this.rebuildAgain) {
      this.rebuildAgain = false;
      this.invalidate();
    }
  }
}

module.exports = function onDemandEntryHandler(
  devMiddleware,
  compiler,
  { dir, reload, maxInactiveAge = 1000 * 25 }
) {
  const entries = {};
  const lastAccessPages = [ '' ];
  let doneCallbacks = new EventEmitter();
  const invalidator = new Invalidator(devMiddleware);
  let touchedAPage = false;
  let reloading = false;
  let stopped = false;
  let reloadCallbacks = new EventEmitter();

  compiler.plugin('make', (compilation, done) => {
    invalidator.startBuilding();

    const allEntries = Object.keys(entries).map(page => {
      const { name, entry } = entries[page];
      entries[page].status = BUILDING;
      return addEntry(compilation, compiler.context, name, entry);
    });

    Promise.all(allEntries)
      .then(() => done())
      .catch(done);
  });

  compiler.plugin('done', stats => {
    const { compilation } = stats;
    const hardFailedPages = compilation.errors
      .filter(e => {
        // Make sure to only pick errors which marked with missing modules
        const hasNoModuleFoundError =
          /ENOENT/.test(e.message) || /Module not found/.test(e.message);
        if (!hasNoModuleFoundError) return false;

        // The page itself is missing. So this is a failed page.
        if (IS_BUNDLED_PAGE.test(e.module.name)) return true;

        // No dependencies means this is a top level page.
        // So this is a failed page.
        return e.module.dependencies.length === 0;
      })
      .map(e => e.module.chunks)
      .reduce((a, b) => [ ...a, ...b ], [])
      .map(c => {
        const pageName = MATCH_ROUTE_NAME.exec(c.name)[1];
        return normalizePage(`/${pageName}`);
      });

    // Call all the doneCallbacks
    Object.keys(entries).forEach(page => {
      const entryInfo = entries[page];
      if (entryInfo.status !== BUILDING) return;

      // With this, we are triggering a filesystem based watch trigger
      // It'll memorize some timestamp related info related to common files used
      // in the page
      // That'll reduce the page building time significantly.
      if (!touchedAPage) {
        setTimeout(() => {
          touch.sync(entryInfo.pathname);
        }, 1000);
        touchedAPage = true;
      }

      entryInfo.status = BUILT;
      entries[page].lastActiveTime = Date.now();
      doneCallbacks.emit(page);
    });

    invalidator.doneBuilding();

    if (hardFailedPages.length > 0 && !reloading) {
      console.log(
        `> Reloading webpack due to inconsistant state of pages(s): ${hardFailedPages.join(
          ', '
        )}`
      );
      reloading = true;
      reload()
        .then(() => {
          console.log('> Webpack reloaded.');
          reloadCallbacks.emit('done');
          stop();
        })
        .catch(err => {
          console.error(`> Webpack reloading failed: ${err.message}`);
          console.error(err.stack);
          process.exit(1);
        });
    }
  });

  const disposeHandler = setInterval(() => {
    if (stopped) return;
    disposeInactiveEntries(
      devMiddleware,
      entries,
      lastAccessPages,
      maxInactiveAge
    );
  }, 5000);

  disposeHandler.unref();

  function stop() {
    clearInterval(disposeHandler);
    stopped = true;
    doneCallbacks = null;
    reloadCallbacks = null;
  }

  return {
    waitUntilReloaded() {
      if (!reloading) return Promise.resolve(true);
      return new Promise(resolve => {
        reloadCallbacks.once('done', () => {
          resolve();
        });
      });
    },

    async ensurePage(page) {
      await this.waitUntilReloaded();
      page = normalizePage(page);

      const pagePath = join(dir, 'page', page);
      const pathname = await resolvePath(pagePath);
      const name = join('bundles', pathname.substring(dir.length));

      const entry = [ `${pathname}?entry` ];

      await new Promise((resolve, reject) => {
        const entryInfo = entries[page];

        if (entryInfo) {
          if (entryInfo.status === BUILT) {
            resolve();
            return;
          }

          if (entryInfo.status === BUILDING) {
            doneCallbacks.on(page, processCallback);
            return;
          }
        }

        reloadWorker();

        console.log(`> Building page: ${page}`);

        entries[page] = { name, entry, pathname, status: ADDED };
        doneCallbacks.on(page, processCallback);

        invalidator.invalidate();

        function processCallback(err) {
          if (err) return reject(err);
          resolve();
          console.log(`> Builded page: ${page}`);
        }
      });
    },

    middleware() {
      return async function(ctx, next) {
        if (stopped) {
          // If this handler is stopped, we need to reload the user's browser.
          // So the user could connect to the actually running handler.
          ctx.status = 302;
          ctx.set('Location', ctx.url);
          ctx.body = '302';
        } else if (reloading) {
          // Webpack config is reloading. So, we need to wait until it's done and
          // reload user's browser.
          // So the user could connect to the new handler and webpack setup.
          this.waitUntilReloaded().then(() => {
            ctx.status = 302;
            ctx.set('Location', ctx.url);
            ctx.body = '302';
          });
        } else {
          if (!/^\/_app\/on-demand-entries-ping/.test(ctx.url)) {
            return await next();
          }

          const page = normalizePage(ctx.request.query.page);
          const entryInfo = entries[page];

          // If there's no entry.
          // Then it seems like an weird issue.
          if (!entryInfo) {
            const message = `Client pings, but there's no entry for page: ${page}`;
            console.error(message);
            sendJson(ctx, { invalid: true });
            return;
          }

          sendJson(ctx, { success: true });

          // We don't need to maintain active state of anything other than BUILT entries
          if (entryInfo.status !== BUILT) return;

          // If there's an entryInfo
          lastAccessPages.pop();
          lastAccessPages.unshift(page);
          entryInfo.lastActiveTime = Date.now();
        }
      };
    },
  };
};

function addEntry(compilation, context, name, entry) {
  return new Promise((resolve, reject) => {
    const dep = DynamicEntryPlugin.createDependency(entry, name);
    compilation.addEntry(context, dep, name, err => {
      if (err) return reject(err);
      resolve();
    });
  });
}

// dispose inactive pages
function disposeInactiveEntries(
  devMiddleware,
  entries,
  lastAccessPages,
  maxInactiveAge
) {
  const disposingPages = [];

  Object.keys(entries).forEach(page => {
    const { lastActiveTime, status } = entries[page];

    // This means this entry is currently building or just added
    // We don't need to dispose those entries.
    if (status !== BUILT) return;

    // We should not build the last accessed page even we didn't get any pings
    // Sometimes, it's possible our XHR ping to wait before completing other requests.
    // In that case, we should not dispose the current viewing page
    if (lastAccessPages[0] === page) return;

    if (Date.now() - lastActiveTime > maxInactiveAge) {
      disposingPages.push(page);
    }
  });

  if (disposingPages.length > 0) {
    disposingPages.forEach(page => {
      delete entries[page];
    });
    console.log(`> Disposing inactive page(s): ${disposingPages.join(', ')}`);
    devMiddleware.invalidate();
  }
}

// /index and / is the same. So, we need to identify both pages as the same.
// This also applies to sub pages as well.
function normalizePage(page) {
  return page.replace(/\/index$/, '/');
}

function sendJson(ctx, payload) {
  ctx.type = 'application/json';
  ctx.status = 200;
  ctx.body = JSON.stringify(payload);
}
