import { join } from 'path';
import { existsSync } from 'fs';
import { createElement } from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import send from 'send';
import generateETag from 'etag';
import fresh from 'fresh';
import requireModule from './require';
import resolvePath from './resolve';
import { Router } from '../shared/router';
import { loadGetInitialProps } from '../shared/utils';
import Head, { defaultHead } from '../shared/head';
import App from '../shared/app';
import ErrorDebug from '../shared/error-debug';
import { flushChunks } from '../shared/dynamic';
import startI18n from '../shared/i18n';

import xssFilters from 'xss-filters';

export async function render(req, res, pathname, query, opts) {
  const html = await renderToHTML(req, res, pathname, query, opts);
  sendHTML(req, res, html, req.method, opts);
}

export function renderToHTML(req, res, pathname, query, opts) {
  return doRender(req, res, pathname, query, opts);
}

export async function renderError(err, req, res, pathname, query, opts) {
  const html = await renderErrorToHTML(err, req, res, query, opts);
  sendHTML(req, res, html, req.method, opts);
}

export function renderErrorToHTML(err, req, res, pathname, query, opts = {}) {
  return doRender(req, res, pathname, query, { ...opts, err, page: '_error' });
}

async function getTranslation(lang, fileDir) {
  let json
  try {
    json = await requireModule(
      join(fileDir, 'locales', lang, 'translations')
    );
  } catch(err) {
    json = {}
  }
  return {
    [lang]: {
      translations: json,
    },
  };
}

async function doRender(
  req,
  res,
  pathname,
  query,
  {
    err,
    page,
    lang = 'id',
    buildId,
    buildStats,
    hotReloader,
    assetPrefix,
    availableChunks,
    dir = process.cwd(),
    distDir,
    dev = false,
    staticMarkup = false,
    avetExport = false,
  } = {}
) {
  page = page || pathname;

  await ensurePage(page, { dir, hotReloader });

  let [ Component, Document ] = await Promise.all([
    requireModule(join(dir, distDir, 'dist', 'page', page)),
    requireModule(join(dir, distDir, 'dist', 'page', '_document')),
  ]);

  const translations = await getTranslation(lang, join(dir, 'asset'));
  const i18n = startI18n(translations, lang);

  Component = Component.default || Component;
  Document = Document.default || Document;

  const asPath = req.url;
  const ctx = { err, req, res, pathname, query, asPath };
  const props = await loadGetInitialProps(Component, ctx);

  // the response might be finshed on the getinitialprops call
  if (res.finished) return;

  const renderPage = () => {
    const app = createElement(App, {
      props,
      Component,
      router: new Router(pathname, query),
    });

    const render = staticMarkup ? renderToStaticMarkup : renderToString;

    let html;
    let head;
    let errorHtml = '';
    try {
      html = render(app);
    } finally {
      head = Head.rewind() || defaultHead();
    }
    const chunks = loadChunks({ dev, dir, distDir, availableChunks });

    if (err && dev) {
      errorHtml = render(createElement(ErrorDebug, { error: err }));
    }

    return { html, head, errorHtml, chunks };
  };

  const docProps = await loadGetInitialProps(Document, { ...ctx, renderPage });
  // While developing, we should not cache any assets.
  // So, we use a different buildId for each page load.
  // With that we can ensure, we have unique URL for assets per every page load.
  // So, it'll prevent issues like this: https://git.io/vHLtb
  const devBuildId = Date.now();

  if (res.finished) return;

  if (!Document.prototype || !Document.prototype.isReactComponent) {
    throw new Error('_document.js is not exporting a React element');
  }

  const doc = createElement(Document, {
    __AVET_DATA__: {
      props,
      translations,
      lang,
      pathname,
      query,
      buildId: dev ? devBuildId : buildId,
      buildStats,
      assetPrefix,
      avetExport,
      err: err ? serializeError(dev, err) : null,
    },
    dev,
    dir,
    staticMarkup,
    ...docProps,
  });

  return '<!DOCTYPE html>' + renderToStaticMarkup(doc);
}

export async function renderScript(req, res, page, opts) {
  try {
    const path = join(opts.dir, opts.distDir, 'bundles', 'page', page);
    const realPath = await resolvePath(path);
    await serveStatic(req, res, realPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      renderScriptError(req, res, page, err, {}, opts);
      return;
    }

    throw err;
  }
}

export async function renderScriptError(
  req,
  res,
  page,
  error,
  customFields,
  opts
) {
  // Asks CDNs and others to not to cache the errored page
  res.setHeader('Cache-Control', 'no-store, must-revalidate');
  // prevent XSS attacks by filtering the page before printing it.
  page = xssFilters.uriInSingleQuotedAttr(page);

  if (error.code === 'ENOENT') {
    res.setHeader('Content-Type', 'text/javascript');
    res.end(`
      window.__AVET_REGISTER_PAGE('${page}', function() {
        var error = new Error('Page does not exist: ${page}')
        error.statusCode = 404

        return { error: error }
      })
    `);
    return;
  }

  res.setHeader('Content-Type', 'text/javascript');
  const errorJson = {
    ...errorToJSON(error),
    ...customFields,
  };

  res.end(`
    window.__AVET_REGISTER_PAGE('${page}', function() {
      var error = ${JSON.stringify(errorJson)}
      return { error: error }
    })
  `);
}

export function sendHTML(req, res, html, method, { dev }) {
  if (res.finished) return;
  const etag = generateETag(html);

  if (fresh(req.headers, { etag })) {
    res.statusCode = 304;
    res.end();
    return;
  }

  if (dev) {
    // In dev, we should not cache pages for any reason.
    // That's why we do this.
    res.setHeader('Cache-Control', 'no-store, must-revalidate');
  }

  res.setHeader('ETag', etag);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(html));
  res.end(method === 'HEAD' ? null : html);
}

export function sendJSON(res, obj, method) {
  if (res.finished) return;

  const json = JSON.stringify(obj);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(json));
  res.end(method === 'HEAD' ? null : json);
}

function errorToJSON(err) {
  const { name, message, stack } = err;
  const json = { name, message, stack };

  if (err.module) {
    // rawRequest contains the filename of the module which has the error.
    const { rawRequest } = err.module;
    json.module = { rawRequest };
  }

  return json;
}

function serializeError(dev, err) {
  if (dev) {
    return errorToJSON(err);
  }

  return { message: '500 - Internal Server Error.' };
}

export function serveStatic(req, res, path) {
  return new Promise((resolve, reject) => {
    send(req, path)
      .on('directory', () => {
        // We don't allow directories to be read.
        const err = new Error('No directory access');
        err.code = 'ENOENT';
        reject(err);
      })
      .on('error', reject)
      .pipe(res)
      .on('finish', resolve);
  });
}

async function ensurePage(page, { dir, hotReloader }) {
  if (!hotReloader) return;
  if (page === '_error' || page === '_document') return;

  await hotReloader.ensurePage(page);
}

function loadChunks({ dev, dir, distDir, availableChunks }) {
  const flushedChunks = flushChunks();
  const validChunks = [];

  for (const chunk of flushedChunks) {
    const filename = join(dir, distDir, 'chunks', chunk);
    const exists = dev ? existsSync(filename) : availableChunks[chunk];
    if (exists) {
      validChunks.push(chunk);
    }
  }

  return validChunks;
}
