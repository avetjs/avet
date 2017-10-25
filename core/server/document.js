import React, { Component } from 'react';
import PropTypes from 'prop-types';
import htmlescape from 'htmlescape';
import flush from 'styled-jsx/server';

export default class Document extends Component {
  static getInitialProps({ renderPage }) {
    const { html, head, errorHtml, chunks } = renderPage();
    const styles = flush();
    return { html, head, errorHtml, chunks, styles };
  }

  static childContextTypes = {
    _documentProps: PropTypes.any,
  };

  getChildContext() {
    return { _documentProps: this.props };
  }

  render() {
    return (
      <html>
        <Head />
        <body>
          <Main />
          <AvetScript />
        </body>
      </html>
    );
  }
}

export class Head extends Component {
  static contextTypes = {
    _documentProps: PropTypes.any,
  };

  getChunkPreloadLink(filename) {
    const { __AVET_DATA__ } = this.context._documentProps;
    const { buildStats, assetPrefix, buildId } = __AVET_DATA__;
    const hash = buildStats ? buildStats[filename].hash : buildId;

    return (
      <link
        key={filename}
        rel="preload"
        href={`${assetPrefix}/_avet/${hash}/${filename}`}
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
    return [ this.getChunkPreloadLink('app.js') ];
  }

  getPreloadDynamicChunks() {
    const { chunks, __AVET_DATA__ } = this.context._documentProps;
    const { assetPrefix } = __AVET_DATA__;
    return chunks.map(chunk =>
      <link
        key={chunk}
        rel="preload"
        href={`${assetPrefix}/_avet/webpack/chunks/${chunk}`}
        as="script"
      />
    );
  }

  render() {
    const { head, styles, __AVET_DATA__ } = this.context._documentProps;
    const { pathname, buildId, assetPrefix, avetExport } = __AVET_DATA__;
    const pagePathname = getPagePathname(pathname, avetExport);

    return (
      <head {...this.props}>
        <link
          rel="preload"
          href={`${assetPrefix}/_avet/${buildId}/page${pagePathname}`}
          as="script"
        />
        <link
          rel="preload"
          href={`${assetPrefix}/_avet/${buildId}/page/_error/index.js`}
          as="script"
        />
        {this.getPreloadDynamicChunks()}
        {this.getPreloadMainLinks()}
        {(head || []).map((h, i) => React.cloneElement(h, { key: i }))}
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
    return (
      <div className={className}>
        <div id="__avet" dangerouslySetInnerHTML={{ __html: html }} />
        <div
          id="__avet-error"
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
    const { __AVET_DATA__ } = this.context._documentProps;
    const { buildStats, assetPrefix, buildId } = __AVET_DATA__;
    const hash = buildStats ? buildStats[filename].hash : buildId;

    return (
      <script
        key={filename}
        type="text/javascript"
        src={`${assetPrefix}/_avet/${hash}/${filename}`}
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
    return [ this.getChunkScript('app.js', { async: true }) ];
  }

  getDynamicChunks() {
    const { chunks, __AVET_DATA__ } = this.context._documentProps;
    const { assetPrefix } = __AVET_DATA__;
    return (
      <div>
        {chunks.map(chunk =>
          <script
            async
            key={chunk}
            type="text/javascript"
            src={`${assetPrefix}/_avet/webpack/chunks/${chunk}`}
          />
        )}
      </div>
    );
  }

  render() {
    const { staticMarkup, __AVET_DATA__, chunks } = this.context._documentProps;
    const { pathname, avetExport, buildId, assetPrefix } = __AVET_DATA__;
    const pagePathname = getPagePathname(pathname, avetExport);

    __AVET_DATA__.chunks = chunks;

    return (
      <div>
        {staticMarkup
          ? null
          : <script
            dangerouslySetInnerHTML={{
              __html: `
          __AVET_DATA__ = ${htmlescape(__AVET_DATA__)}
          module={}
          __AVET_LOADED_PAGES__ = []
          __AVET_LOADED_CHUNKS__ = []

          __AVET_REGISTER_PAGE = function (route, fn) {
            __AVET_LOADED_PAGES__.push({ route: route, fn: fn })
          }

          __AVET_REGISTER_CHUNK = function (chunkName, fn) {
            __AVET_LOADED_CHUNKS__.push({ chunkName: chunkName, fn: fn })
          }
        `,
            }}
          />}
        <script
          async
          id={`__AVET_PAGE__${pathname}`}
          type="text/javascript"
          src={`${assetPrefix}/_avet/${buildId}/page${pagePathname}`}
        />
        <script
          async
          id={'__AVET_PAGE__/_error'}
          type="text/javascript"
          src={`${assetPrefix}/_avet/${buildId}/page/_error/index.js`}
        />
        {staticMarkup ? null : this.getDynamicChunks()}
        {staticMarkup ? null : this.getScripts()}
      </div>
    );
  }
}

function getPagePathname(pathname, avetExport) {
  if (!avetExport) return pathname;
  if (pathname === '/') return '/index.js';
  return `${pathname}/index.js`;
}
