import React, { Component, createClass } from 'react';
import PropTypes from 'prop-types';
import shallowEquals from './shallow-equals';
import { warn } from './utils';
import { makePublicRouterInstance } from './router';
import avet from './avet';
import Plugin from '../plugin';

export default class App extends Component {
  state = {
    hasError: null
  }

  static childContextTypes = {
    headManager: PropTypes.object,
    router: PropTypes.object
  }

  getChildContext() {
    const { headManager } = this.props;
    return {
      headManager,
      router: makePublicRouterInstance(this.props.router)
    };
  }

  componentDidCatch (error, info) {
    error.stack = `${error.stack}\n\n${info.componentStack}`
    window.next.renderError(error)
    this.setState({ hasError: true })
  }

  render() {
    const { Component, props, hash, router } = this.props;
    const url = createUrl(router);
    // If there no component exported we can't proceed.
    // We'll tackle that here.
    if (typeof Component !== 'function') {
      throw new Error(
        `The default export is not a React Component in page: "${url.pathname}"`
      );
    }

    const containerProps = { Component, props, hash, router, url };

    return (
      <div>
        <Plugin/>
        <Container {...containerProps} />
      </div>
    );
  }
}

class Container extends Component {
  componentDidMount() {
    this.scrollToHash();
  }

  componentDidUpdate() {
    this.scrollToHash();
  }

  scrollToHash() {
    const { hash } = this.props;
    if (!hash) return;

    const el = document.getElementById(hash);
    if (!el) return;

    // If we call scrollIntoView() in here without a setTimeout
    // it won't scroll properly.
    setTimeout(() => el.scrollIntoView(), 0);
  }

  shouldComponentUpdate(nextProps) {
    // need this check not to rerender component which has already thrown an error
    return !shallowEquals(this.props, nextProps);
  }

  render() {
    const { Component, props, url } = this.props;

    // const modelProps = {};
    // const modelName = [];
    // Object.keys(props).forEach(name => {
    //   const prop = props[name];
    //   if (prop instanceof Model) {
    //     modelProps[name] = prop;
    //     modelName.push(name);
    //   }
    // });

    // const ObserverContainer = inject(...modelName)(observer(Component));

    if (process.env.NODE_ENV === 'production') {
      // return (
      //   <Provider {...modelProps}>
      //     <ObserverContainer {...props} />
      //   </Provider>
      // );
      return (<Component {...props} url={url} />);
    }

    const ErrorDebug = require('./error-debug').default;
    const { AppContainer } = require('react-hot-loader');

    // includes AppContainer which bypasses shouldComponentUpdate method
    // https://github.com/gaearon/react-hot-loader/issues/442
    return (
      <AppContainer warnings={false} errorReporter={ErrorDebug}>
        <Component {...props} url={url}/>
      </AppContainer>
    );
  }
}

function createUrl(router) {
  return {
    query: router.query,
    pathname: router.pathname,
    asPath: router.asPath,
    back: () => {
      warn(
        'Warning: \'url.back()\' is deprecated. Use "window.history.back()"'
      );
      router.back();
    },
    push: (url, as) => {
      warn('Warning: \'url.push()\' is deprecated. Use "avet/router" APIs.');
      return router.push(url, as);
    },
    pushTo: (href, as) => {
      warn('Warning: \'url.pushTo()\' is deprecated. Use "avet/router" APIs.');
      const pushRoute = as ? href : null;
      const pushUrl = as || href;

      return router.push(pushRoute, pushUrl);
    },
    replace: (url, as) => {
      warn('Warning: \'url.replace()\' is deprecated. Use "avet/router" APIs.');
      return router.replace(url, as);
    },
    replaceTo: (href, as) => {
      warn(
        'Warning: \'url.replaceTo()\' is deprecated. Use "avet/router" APIs.'
      );
      const replaceRoute = as ? href : null;
      const replaceUrl = as || href;

      return router.replace(replaceRoute, replaceUrl);
    },
  };
}
