import React, { Component } from 'react';
import PropTypes from 'prop-types';
import htmlescape from 'htmlescape';
import flush from 'styled-jsx/server';

const mixinHtmlComponents = [];
const mixinHeadComponents = [];
const mixinMainComponents = [];

function getPagePathname(pathname, avetExport) {
  if (!avetExport) return pathname;
  if (pathname === '/') return '/index.js';
  return `${pathname}/index.js`;
}

function isReactComponent(Component) {
  if (Component.prototype && Component.prototype.isReactComponent) {
    return true;
  }
  return false;
}

export class Html extends Component {
  static defaultProps = {
    lang: 'en',
  };

  render() {
    const { props } = this;
    const { lang } = props;
    let mixinProps = {};
    let mixinChild = [];

    if (mixinHtmlComponents.length) {
      mixinHtmlComponents.forEach(comp => {
        if (comp.props) {
          mixinProps = Object.assign(mixinProps, comp.props);
        }
        let content = isReactComponent(comp) ? comp : comp.content;
        if (content) {
          if (!Array.isArray(content)) {
            content = [content];
          }
          mixinChild = mixinChild.concat(content);
        }
      });
    }

    return (
      <html lang={lang} {...mixinProps} {...props}>
        {mixinChild}
        {this.props.children}
      </html>
    );
  }
}

export class Body extends Component {
  render() {
    return <body {...this.props}>{this.props.children}</body>;
  }
}

export class Head extends Component {
  static contextTypes = {
    _documentProps: PropTypes.any,
  };

  getChunkPreloadLink(filename) {
    const { __APP_DATA__ } = this.context._documentProps;
    const { buildStats, assetPrefix, buildId } = __APP_DATA__;
    const hash = buildStats ? buildStats[filename].hash : buildId;

    return (
      <link
        key={filename}
        rel="preload"
        href={`${assetPrefix}/_app/${hash}/${filename}`}
        as="script"
      />
    );
  }

  getPreloadMainLinks() {
    const { dev } = this.context._documentProps;
    if (dev) {
      return [
        this.getChunkPreloadLink('manifest.js'),
        this.getChunkPreloadLink('commons.js'),
        this.getChunkPreloadLink('main.js'),
      ];
    }

    // In the production mode, we have a single asset with all the JS content.
    return [this.getChunkPreloadLink('app.js')];
  }

  getPreloadDynamicChunks() {
    const { chunks, __APP_DATA__ } = this.context._documentProps;
    const { assetPrefix } = __APP_DATA__;
    return chunks.map(chunk => (
      <link
        key={chunk}
        rel="preload"
        href={`${assetPrefix}/_app/webpack/chunks/${chunk}`}
        as="script"
      />
    ));
  }

  render() {
    const { head, styles, __APP_DATA__ } = this.context._documentProps;
    const { pathname, buildId, assetPrefix, avetExport } = __APP_DATA__;
    const pagePathname = getPagePathname(pathname, avetExport);

    let mixinProps = {};
    let mixinChild = [];

    if (mixinHeadComponents.length) {
      mixinHeadComponents.forEach(comp => {
        if (comp.props) {
          mixinProps = Object.assign(mixinProps, comp.props);
        }
        let content = isReactComponent(comp) ? comp : comp.content;
        if (content) {
          if (!Array.isArray(content)) {
            content = [content];
          }
          mixinChild = mixinChild.concat(content);
        }
      });
    }

    return (
      <head {...this.props} {...mixinProps}>
        <link
          rel="preload"
          href={`${assetPrefix}/_app/${buildId}/page${pagePathname}`}
          as="script"
        />
        <link
          rel="preload"
          href={`${assetPrefix}/_app/${buildId}/page/_error/index.js`}
          as="script"
        />
        {this.getPreloadDynamicChunks()}
        {this.getPreloadMainLinks()}
        {(head || []).map((h, i) => React.cloneElement(h, { key: i }))}
        {mixinChild}
        {styles || null}
        {this.props.children}
      </head>
    );
  }
}

export class Main extends Component {
  static propTypes = {
    className: PropTypes.string,
  };

  static contextTypes = {
    _documentProps: PropTypes.any,
  };

  render() {
    const { html, errorHtml } = this.context._documentProps;
    const { className } = this.props;
    const mixinMain = [];

    if (mixinMainComponents.length) {
      mixinMainComponents.forEach(comp => {
        if (comp) {
          mixinMain.push(comp);
        }
      });
    }

    return (
      <div className={className}>
        {mixinMain}
        <div id="__app" dangerouslySetInnerHTML={{ __html: html }} />
        <div
          id="__app-error"
          dangerouslySetInnerHTML={{ __html: errorHtml }}
        />
      </div>
    );
  }
}

export class AvetScript extends Component {
  static contextTypes = {
    _documentProps: PropTypes.any,
  };

  getChunkScript(filename, additionalProps = {}) {
    const { __APP_DATA__ } = this.context._documentProps;
    const { buildStats, assetPrefix, buildId } = __APP_DATA__;
    const hash = buildStats ? buildStats[filename].hash : buildId;

    return (
      <script
        key={filename}
        type="text/javascript"
        src={`${assetPrefix}/_app/${hash}/${filename}`}
        {...additionalProps}
      />
    );
  }

  getScripts() {
    const { dev } = this.context._documentProps;
    if (dev) {
      return [
        this.getChunkScript('manifest.js'),
        this.getChunkScript('commons.js'),
        this.getChunkScript('main.js'),
      ];
    }

    // In the production mode, we have a single asset with all the JS content.
    // So, we can load the script with async
    return [this.getChunkScript('app.js', { async: true })];
  }

  getDynamicChunks() {
    const { chunks, __APP_DATA__ } = this.context._documentProps;
    const { assetPrefix } = __APP_DATA__;
    return (
      <div>
        {chunks.map(chunk => (
          <script
            async
            key={chunk}
            type="text/javascript"
            src={`${assetPrefix}/_app/webpack/chunks/${chunk}`}
          />
        ))}
      </div>
    );
  }

  render() {
    const { staticMarkup, __APP_DATA__, chunks } = this.context._documentProps;
    const { pathname, avetExport, buildId, assetPrefix } = __APP_DATA__;
    const pagePathname = getPagePathname(pathname, avetExport);

    __APP_DATA__.chunks = chunks;

    return (
      <div>
        {staticMarkup ? null : (
          <script
            dangerouslySetInnerHTML={{
              __html: `
          __APP_DATA__ = ${htmlescape(__APP_DATA__)}
          module={}
          __APP_LOADED_PAGES__ = []
          __APP_LOADED_CHUNKS__ = []

          __APP_REGISTER_PAGE = function (route, fn) {
            __APP_LOADED_PAGES__.push({ route: route, fn: fn })
          }

          __APP_REGISTER_CHUNK = function (chunkName, fn) {
            __APP_LOADED_CHUNKS__.push({ chunkName: chunkName, fn: fn })
          }
        `,
            }}
          />
        )}
        <script
          async
          id={`__APP_PAGE__${pathname}`}
          type="text/javascript"
          src={`${assetPrefix}/_app/${buildId}/page${pagePathname}`}
        />
        <script
          async
          id={'__APP_PAGE__/_error'}
          type="text/javascript"
          src={`${assetPrefix}/_app/${buildId}/page/_error/index.js`}
        />
        {staticMarkup ? null : this.getDynamicChunks()}
        {staticMarkup ? null : this.getScripts()}
      </div>
    );
  }
}

export default class Document extends Component {
  static getInitialProps({ renderPage }) {
    const { html, head, errorHtml, chunks } = renderPage();
    const styles = flush();
    return { html, head, errorHtml, chunks, styles };
  }

  static childContextTypes = {
    _documentProps: PropTypes.any,
  };

  static mixinHtml(MixinHtmlComponent) {
    mixinHtmlComponents.push(MixinHtmlComponent);
  }

  static mixinHead(MixinHeadComponent) {
    mixinHeadComponents.push(MixinHeadComponent);
  }

  static mixinMain(MixinMainComponent) {
    mixinMainComponents.push(MixinMainComponent);
  }

  getChildContext() {
    return { _documentProps: this.props };
  }

  render() {
    return (
      <Html>
        <Head />
        <Body>
          <Main />
          <AvetScript />
        </Body>
      </Html>
    );
  }
}
