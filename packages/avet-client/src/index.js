import { createElement } from 'react';
import ReactDOM from 'react-dom';
import HeadManager from './head-manager';
import { createRouter } from 'avet-shared/lib/router';
import EventEmitter from 'avet-shared/lib/event-emiiter';
import App from 'avet-shared/lib/app';
import { getURL } from 'avet-shared/lib/utils';
import PageLoader from 'avet-shared/lib/page-loader';
import { loadGetInitialProps, loadGetStore } from 'avet-utils/lib/component';
import { getHttpClient } from 'avet-shared/lib/httpclient';

// Polyfill Promise globally
// This is needed because Webpack2's dynamic loading(common chunks) code
// depends on Promise.
// So, we need to polyfill it.
// See: https://github.com/webpack/webpack/issues/4254
if (!window.Promise) {
  window.Promise = Promise;
}

const {
  __APP_DATA__: {
    props,
    store,
    err,
    pathname,
    query,
    buildId,
    chunks,
    assetPrefix,
  },
  location,
} = window;

const asPath = getURL();

const pageLoader = new PageLoader(buildId, assetPrefix);
window.__APP_LOADED_PAGES__.forEach(({ route, fn }) => {
  pageLoader.registerPage(route, fn);
});
delete window.__APP_LOADED_PAGES__;

window.__APP_LOADED_CHUNKS__.forEach(({ chunkName, fn }) => {
  pageLoader.registerChunk(chunkName, fn);
});
delete window.__APP_LOADED_CHUNKS__;

window.__APP_REGISTER_PAGE = pageLoader.registerPage.bind(pageLoader);
window.__APP_REGISTER_CHUNK = pageLoader.registerChunk.bind(pageLoader);

const headManager = new HeadManager();
const appContainer = document.getElementById('__app');
const errorContainer = document.getElementById('__app-error');

let lastAppProps = {};
export let router;
export let ErrorComponent;
let ErrorDebugComponent;
let Component;
let stripAnsi = s => s;

const prod = process.env.NODE_ENV === 'production';

export const emitter = new EventEmitter();

export default async ({
  ErrorDebugComponent: passedDebugComponent,
  stripAnsi: passedStripAnsi,
} = {}) => {
  // Wait for all the dynamic chunks to get loaded
  for (const chunkName of chunks) {
    await pageLoader.waitForChunk(chunkName);
  }

  let _err = err;

  stripAnsi = passedStripAnsi || stripAnsi;
  ErrorDebugComponent = passedDebugComponent;
  ErrorComponent = await pageLoader.loadPage('/_error');

  try {
    Component = await pageLoader.loadPage(pathname);
  } catch (error) {
    console.error(stripAnsi(`${error.message}\n${error.stack}`));
    _err = error;
    Component = ErrorComponent;
  }

  router = createRouter(pathname, query, asPath, {
    pageLoader,
    Component,
    ErrorComponent,
    err: _err,
  });

  const emitter = new EventEmitter();

  router.subscribe(({ Component, props, store, hash, err }) => {
    render({ Component, props, store, err, hash, emitter });
  });

  const hash = location.hash.substring(1);
  render({ Component, props, store, hash, err: _err, emitter });

  return emitter;
};

export async function render(props) {
  // There are some errors we should ignore.
  // Next.js rendering logic knows how to handle them.
  // These are specially 404 errors
  if (props.err && !props.err.ignore) {
    await renderError(props.err);
    return;
  }

  try {
    await doRender(props);
  } catch (err) {
    if (err.abort) return;
    await renderError(err);
  }
}

// This method handles all runtime and debug errors.
// 404 and 500 errors are special kind of errors
// and they are still handle via the main render method.
export async function renderError(error) {
  // We need to unmount the current app component because it's
  // in the inconsistant state.
  // Otherwise, we need to face issues when the issue is fixed and
  // it's get notified via HMR
  ReactDOM.unmountComponentAtNode(appContainer);

  const errorMessage = `${error.message}\n${error.stack}`;
  console.error(stripAnsi(errorMessage));

  if (prod) {
    const initProps = { err: error, pathname, query, asPath };
    const props = await loadGetInitialProps(ErrorComponent, initProps);
    renderReactElement(createElement(ErrorComponent, props), errorContainer);
  } else {
    renderReactElement(
      createElement(ErrorDebugComponent, { error }),
      errorContainer
    );
  }
}

async function doRender({
  Component,
  props,
  store,
  hash,
  err,
  emitter: emitterProp = emitter,
}) {
  // fetch props if ErrorComponent was replaced with a page component by HMR
  const { pathname, query, asPath } = router;
  const context = {
    err,
    pathname,
    query,
    httpclient: getHttpClient(),
    asPath,
  };
  let storeState;

  if (
    !props &&
    Component &&
    Component !== ErrorComponent &&
    lastAppProps.Component === ErrorComponent
  ) {
    props = await loadGetInitialProps(Component, context);
  }

  if (Component && Component !== ErrorComponent) {
    if (store && Object.keys(store).length > 0) {
      storeState = Object.assign({}, store);
      store = await loadGetStore(Component, context);
      // init store
      for (const i in store) {
        store[i].setState(storeState[i]);
      }
    } else {
      store = await loadGetStore(Component, context);
    }
  }

  Component = Component || lastAppProps.Component;
  props = props || lastAppProps.props;

  const appProps = {
    Component,
    props,
    store,
    hash,
    err,
    router,
    headManager,
  };

  // lastAppProps has to be set before ReactDom.render to account for ReactDom throwing an error.
  lastAppProps = appProps;

  emitterProp.emit('before-reactdom-render', {
    Component,
    ErrorComponent,
    appProps,
  });

  // We need to clear any existing runtime error messages
  ReactDOM.unmountComponentAtNode(errorContainer);
  renderReactElement(createElement(App, appProps), appContainer);

  window.__IS_INIT__ = false;

  emitterProp.emit('after-reactdom-render', {
    Component,
    ErrorComponent,
    appProps,
  });
}

let isInitialRender = true;
function renderReactElement(reactEl, domEl) {
  if (isInitialRender) {
    ReactDOM.hydrate(reactEl, domEl);
    isInitialRender = false;
  } else {
    ReactDOM.render(reactEl, domEl);
  }
}
