import { createElement } from 'react';
import ReactDOM from 'react-dom';
import HeadManager from './head-manager';
import { createRouter } from '../shared/router';
import EventEmitter from '../shared/event-emiiter';
import App from '../shared/app';
import { getURL, loadGetInitialProps } from '../shared/utils';
import PageLoader from '../shared/page-loader';

// Polyfill Promise globally
// This is needed because Webpack2's dynamic loading(common chunks) code
// depends on Promise.
// So, we need to polyfill it.
// See: https://github.com/webpack/webpack/issues/4254
if (!window.Promise) {
  window.Promise = Promise;
}

const {
  __AVET_DATA__: {
    props,
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
window.__AVET_LOADED_PAGES__.forEach(({ route, fn }) => {
  pageLoader.registerPage(route, fn);
});
delete window.__AVET_LOADED_PAGES__;

window.__AVET_LOADED_CHUNKS__.forEach(({ chunkName, fn }) => {
  pageLoader.registerChunk(chunkName, fn);
});
delete window.__AVET_LOADED_CHUNKS__;

window.__AVET_REGISTER_PAGE = pageLoader.registerPage.bind(pageLoader);
window.__AVET_REGISTER_CHUNK = pageLoader.registerChunk.bind(pageLoader);

const headManager = new HeadManager();
const appContainer = document.getElementById('__avet');
const errorContainer = document.getElementById('__avet-error');

let lastAppProps
export let router
export let ErrorComponent
let ErrorDebugComponent
let Component
let stripAnsi = (s) => s


export default async ({ ErrorDebugComponent: passedDebugComponent, stripAnsi: passedStripAnsi } = {}) => {
  // Wait for all the dynamic chunks to get loaded
  for (const chunkName of chunks) {
    await pageLoader.waitForChunk(chunkName)
  }

  stripAnsi = passedStripAnsi || stripAnsi
  ErrorDebugComponent = passedDebugComponent
  ErrorComponent = await pageLoader.loadPage('/_error')

  try {
    Component = await pageLoader.loadPage(pathname)
  } catch (err) {
    console.error(stripAnsi(`${err.message}\n${err.stack}`))
    Component = ErrorComponent
  }

  router = createRouter(pathname, query, asPath, {
    pageLoader,
    Component,
    ErrorComponent,
    err
  })

  const emitter = new EventEmitter()

  router.subscribe(({ Component, props, hash, err }) => {
    render({ Component, props, err, hash, emitter })
  })

  const hash = location.hash.substring(1)
  render({ Component, props, hash, err, emitter })

  return emitter
}

export async function render (props) {
  // There are some errors we should ignore.
  // Next.js rendering logic knows how to handle them.
  // These are specially 404 errors
  if (props.err && !props.err.ignore) {
    await renderError(props.err)
    return
  }

  try {
    await doRender(props)
  } catch (err) {
    if (err.abort) return
    await renderError(err)
  }
}

// This method handles all runtime and debug errors.
// 404 and 500 errors are special kind of errors
// and they are still handle via the main render method.
export async function renderError (error) {
  const prod = process.env.NODE_ENV === 'production'
  // We need to unmount the current app component because it's
  // in the inconsistant state.
  // Otherwise, we need to face issues when the issue is fixed and
  // it's get notified via HMR
  ReactDOM.unmountComponentAtNode(appContainer)

  const errorMessage = `${error.message}\n${error.stack}`
  console.error(stripAnsi(errorMessage))

  if (prod) {
    const initProps = { err: error, pathname, query, asPath }
    const props = await loadGetInitialProps(ErrorComponent, initProps)
    renderReactElement(createElement(ErrorComponent, props), errorContainer)
  } else {
    renderReactElement(createElement(ErrorDebugComponent, { error }), errorContainer)
  }
}

async function doRender ({ Component, props, hash, err, emitter }) {
  if (!props && Component &&
    Component !== ErrorComponent &&
    lastAppProps.Component === ErrorComponent) {
    // fetch props if ErrorComponent was replaced with a page component by HMR
    const { pathname, query, asPath } = router
    props = await loadGetInitialProps(Component, { err, pathname, query, asPath })
  }

  if (emitter) {
    emitter.emit('before-reactdom-render', { Component, ErrorComponent })
  }

  Component = Component || lastAppProps.Component
  props = props || lastAppProps.props

  const appProps = { Component, props, hash, err, router, headManager }
  // lastAppProps has to be set before ReactDom.render to account for ReactDom throwing an error.
  lastAppProps = appProps

  // We need to clear any existing runtime error messages
  ReactDOM.unmountComponentAtNode(errorContainer)
  renderReactElement(createElement(App, appProps), appContainer)

  if (emitter) {
    emitter.emit('after-reactdom-render', { Component, ErrorComponent })
  }
}

let isInitialRender = true
function renderReactElement (reactEl, domEl) {
  if (isInitialRender) {
    ReactDOM.hydrate(reactEl, domEl)
    isInitialRender = false
  } else {
    ReactDOM.render(reactEl, domEl)
  }
}
