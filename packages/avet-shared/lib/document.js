'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AvetScript = exports.Main = exports.Head = exports.Body = exports.Html = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _htmlescape = require('htmlescape');

var _htmlescape2 = _interopRequireDefault(_htmlescape);

var _server = require('styled-jsx/server');

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mixinHtmlComponents = [];
var mixinHeadComponents = [];
var mixinMainComponents = [];

function getPagePathname(pathname, avetExport) {
  if (!avetExport) return pathname;
  if (pathname === '/') return '/index.js';
  return pathname + '/index.js';
}

var Html = exports.Html = function (_Component) {
  (0, _inherits3.default)(Html, _Component);

  function Html() {
    (0, _classCallCheck3.default)(this, Html);
    return (0, _possibleConstructorReturn3.default)(this, (Html.__proto__ || (0, _getPrototypeOf2.default)(Html)).apply(this, arguments));
  }

  (0, _createClass3.default)(Html, [{
    key: 'render',
    value: function render() {
      var props = this.props;
      var lang = props.lang;

      var mixinProps = {};
      var mixinChild = [];

      if (mixinHtmlComponents.length) {
        mixinHtmlComponents.forEach(function (comp) {
          if (comp.props) {
            mixinProps = (0, _assign2.default)(mixinProps, comp.props);
          }
          if (comp.content) {
            var child = comp.content;
            if (!Array.isArray(child)) {
              child = [child];
            }
            mixinChild = mixinChild.concat(child);
          }
        });
      }

      return _react2.default.createElement(
        'html',
        (0, _extends3.default)({ lang: lang }, mixinProps, props),
        mixinChild,
        this.props.children
      );
    }
  }]);
  return Html;
}(_react.Component);

Html.defaultProps = {
  lang: 'en'
};

var Body = exports.Body = function (_Component2) {
  (0, _inherits3.default)(Body, _Component2);

  function Body() {
    (0, _classCallCheck3.default)(this, Body);
    return (0, _possibleConstructorReturn3.default)(this, (Body.__proto__ || (0, _getPrototypeOf2.default)(Body)).apply(this, arguments));
  }

  (0, _createClass3.default)(Body, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'body',
        this.props,
        this.props.children
      );
    }
  }]);
  return Body;
}(_react.Component);

var Head = exports.Head = function (_Component3) {
  (0, _inherits3.default)(Head, _Component3);

  function Head() {
    (0, _classCallCheck3.default)(this, Head);
    return (0, _possibleConstructorReturn3.default)(this, (Head.__proto__ || (0, _getPrototypeOf2.default)(Head)).apply(this, arguments));
  }

  (0, _createClass3.default)(Head, [{
    key: 'getChunkPreloadLink',
    value: function getChunkPreloadLink(filename) {
      var __AVET_DATA__ = this.context._documentProps.__AVET_DATA__;
      var buildStats = __AVET_DATA__.buildStats,
          assetPrefix = __AVET_DATA__.assetPrefix,
          buildId = __AVET_DATA__.buildId;

      var hash = buildStats ? buildStats[filename].hash : buildId;

      return _react2.default.createElement('link', {
        key: filename,
        rel: 'preload',
        href: assetPrefix + '/_avet/' + hash + '/' + filename,
        as: 'script'
      });
    }
  }, {
    key: 'getPreloadMainLinks',
    value: function getPreloadMainLinks() {
      var dev = this.context._documentProps.dev;

      if (dev) {
        return [this.getChunkPreloadLink('manifest.js'), this.getChunkPreloadLink('commons.js'), this.getChunkPreloadLink('main.js')];
      }

      // In the production mode, we have a single asset with all the JS content.
      return [this.getChunkPreloadLink('app.js')];
    }
  }, {
    key: 'getPreloadDynamicChunks',
    value: function getPreloadDynamicChunks() {
      var _context$_documentPro = this.context._documentProps,
          chunks = _context$_documentPro.chunks,
          __AVET_DATA__ = _context$_documentPro.__AVET_DATA__;
      var assetPrefix = __AVET_DATA__.assetPrefix;

      return chunks.map(function (chunk) {
        return _react2.default.createElement('link', {
          key: chunk,
          rel: 'preload',
          href: assetPrefix + '/_avet/webpack/chunks/' + chunk,
          as: 'script'
        });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$_documentPro2 = this.context._documentProps,
          head = _context$_documentPro2.head,
          styles = _context$_documentPro2.styles,
          __AVET_DATA__ = _context$_documentPro2.__AVET_DATA__;
      var pathname = __AVET_DATA__.pathname,
          buildId = __AVET_DATA__.buildId,
          assetPrefix = __AVET_DATA__.assetPrefix,
          avetExport = __AVET_DATA__.avetExport;

      var pagePathname = getPagePathname(pathname, avetExport);

      var mixinProps = {};
      var mixinChild = [];

      if (mixinHeadComponents.length) {
        mixinHeadComponents.forEach(function (comp) {
          if (comp.props) {
            mixinProps = (0, _assign2.default)(mixinProps, comp.props);
          }
          if (comp.content) {
            var child = comp.content;
            if (!Array.isArray(child)) {
              child = [child];
            }
            mixinChild = mixinChild.concat(child);
          }
        });
      }

      return _react2.default.createElement(
        'head',
        (0, _extends3.default)({}, this.props, mixinProps),
        _react2.default.createElement('link', {
          rel: 'preload',
          href: assetPrefix + '/_avet/' + buildId + '/page' + pagePathname,
          as: 'script'
        }),
        _react2.default.createElement('link', {
          rel: 'preload',
          href: assetPrefix + '/_avet/' + buildId + '/page/_error/index.js',
          as: 'script'
        }),
        this.getPreloadDynamicChunks(),
        this.getPreloadMainLinks(),
        (head || []).map(function (h, i) {
          return _react2.default.cloneElement(h, { key: i });
        }),
        mixinChild,
        styles || null,
        this.props.children
      );
    }
  }]);
  return Head;
}(_react.Component);

Head.contextTypes = {
  _documentProps: _propTypes2.default.any
};

var Main = exports.Main = function (_Component4) {
  (0, _inherits3.default)(Main, _Component4);

  function Main() {
    (0, _classCallCheck3.default)(this, Main);
    return (0, _possibleConstructorReturn3.default)(this, (Main.__proto__ || (0, _getPrototypeOf2.default)(Main)).apply(this, arguments));
  }

  (0, _createClass3.default)(Main, [{
    key: 'render',
    value: function render() {
      var _context$_documentPro3 = this.context._documentProps,
          html = _context$_documentPro3.html,
          errorHtml = _context$_documentPro3.errorHtml;
      var className = this.props.className;

      var mixinMain = [];

      if (mixinMainComponents.length) {
        mixinMainComponents.forEach(function (comp) {
          if (comp) {
            mixinMain.push(comp);
          }
        });
      }

      return _react2.default.createElement(
        'div',
        { className: className },
        mixinMain,
        _react2.default.createElement('div', { id: '__avet', dangerouslySetInnerHTML: { __html: html } }),
        _react2.default.createElement('div', {
          id: '__avet-error',
          dangerouslySetInnerHTML: { __html: errorHtml }
        })
      );
    }
  }]);
  return Main;
}(_react.Component);

Main.propTypes = {
  className: _propTypes2.default.string
};
Main.contextTypes = {
  _documentProps: _propTypes2.default.any
};

var AvetScript = exports.AvetScript = function (_Component5) {
  (0, _inherits3.default)(AvetScript, _Component5);

  function AvetScript() {
    (0, _classCallCheck3.default)(this, AvetScript);
    return (0, _possibleConstructorReturn3.default)(this, (AvetScript.__proto__ || (0, _getPrototypeOf2.default)(AvetScript)).apply(this, arguments));
  }

  (0, _createClass3.default)(AvetScript, [{
    key: 'getChunkScript',
    value: function getChunkScript(filename) {
      var additionalProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var __AVET_DATA__ = this.context._documentProps.__AVET_DATA__;
      var buildStats = __AVET_DATA__.buildStats,
          assetPrefix = __AVET_DATA__.assetPrefix,
          buildId = __AVET_DATA__.buildId;

      var hash = buildStats ? buildStats[filename].hash : buildId;

      return _react2.default.createElement('script', (0, _extends3.default)({
        key: filename,
        type: 'text/javascript',
        src: assetPrefix + '/_avet/' + hash + '/' + filename
      }, additionalProps));
    }
  }, {
    key: 'getScripts',
    value: function getScripts() {
      var dev = this.context._documentProps.dev;

      if (dev) {
        return [this.getChunkScript('manifest.js'), this.getChunkScript('commons.js'), this.getChunkScript('main.js')];
      }

      // In the production mode, we have a single asset with all the JS content.
      // So, we can load the script with async
      return [this.getChunkScript('app.js', { async: true })];
    }
  }, {
    key: 'getDynamicChunks',
    value: function getDynamicChunks() {
      var _context$_documentPro4 = this.context._documentProps,
          chunks = _context$_documentPro4.chunks,
          __AVET_DATA__ = _context$_documentPro4.__AVET_DATA__;
      var assetPrefix = __AVET_DATA__.assetPrefix;

      return _react2.default.createElement(
        'div',
        null,
        chunks.map(function (chunk) {
          return _react2.default.createElement('script', {
            async: true,
            key: chunk,
            type: 'text/javascript',
            src: assetPrefix + '/_avet/webpack/chunks/' + chunk
          });
        })
      );
    }
  }, {
    key: 'render',
    value: function render() {
      var _context$_documentPro5 = this.context._documentProps,
          staticMarkup = _context$_documentPro5.staticMarkup,
          __AVET_DATA__ = _context$_documentPro5.__AVET_DATA__,
          chunks = _context$_documentPro5.chunks;
      var pathname = __AVET_DATA__.pathname,
          avetExport = __AVET_DATA__.avetExport,
          buildId = __AVET_DATA__.buildId,
          assetPrefix = __AVET_DATA__.assetPrefix;

      var pagePathname = getPagePathname(pathname, avetExport);

      __AVET_DATA__.chunks = chunks;

      return _react2.default.createElement(
        'div',
        null,
        staticMarkup ? null : _react2.default.createElement('script', {
          dangerouslySetInnerHTML: {
            __html: '\n          __AVET_DATA__ = ' + (0, _htmlescape2.default)(__AVET_DATA__) + '\n          module={}\n          __AVET_LOADED_PAGES__ = []\n          __AVET_LOADED_CHUNKS__ = []\n\n          __AVET_REGISTER_PAGE = function (route, fn) {\n            __AVET_LOADED_PAGES__.push({ route: route, fn: fn })\n          }\n\n          __AVET_REGISTER_CHUNK = function (chunkName, fn) {\n            __AVET_LOADED_CHUNKS__.push({ chunkName: chunkName, fn: fn })\n          }\n        '
          }
        }),
        _react2.default.createElement('script', {
          async: true,
          id: '__AVET_PAGE__' + pathname,
          type: 'text/javascript',
          src: assetPrefix + '/_avet/' + buildId + '/page' + pagePathname
        }),
        _react2.default.createElement('script', {
          async: true,
          id: '__AVET_PAGE__/_error',
          type: 'text/javascript',
          src: assetPrefix + '/_avet/' + buildId + '/page/_error/index.js'
        }),
        staticMarkup ? null : this.getDynamicChunks(),
        staticMarkup ? null : this.getScripts()
      );
    }
  }]);
  return AvetScript;
}(_react.Component);

AvetScript.contextTypes = {
  _documentProps: _propTypes2.default.any
};

var Document = function (_Component6) {
  (0, _inherits3.default)(Document, _Component6);

  function Document() {
    (0, _classCallCheck3.default)(this, Document);
    return (0, _possibleConstructorReturn3.default)(this, (Document.__proto__ || (0, _getPrototypeOf2.default)(Document)).apply(this, arguments));
  }

  (0, _createClass3.default)(Document, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return { _documentProps: this.props };
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        Html,
        null,
        _react2.default.createElement(Head, null),
        _react2.default.createElement(
          Body,
          null,
          _react2.default.createElement(Main, null),
          _react2.default.createElement(AvetScript, null)
        )
      );
    }
  }], [{
    key: 'getInitialProps',
    value: function getInitialProps(_ref) {
      var renderPage = _ref.renderPage;

      var _renderPage = renderPage(),
          html = _renderPage.html,
          head = _renderPage.head,
          errorHtml = _renderPage.errorHtml,
          chunks = _renderPage.chunks;

      var styles = (0, _server2.default)();
      return { html: html, head: head, errorHtml: errorHtml, chunks: chunks, styles: styles };
    }
  }, {
    key: 'mixinHtml',
    value: function mixinHtml(MixinHtmlComponent) {
      mixinHtmlComponents.push(MixinHtmlComponent);
    }
  }, {
    key: 'mixinHead',
    value: function mixinHead(MixinHeadComponent) {
      mixinHeadComponents.push(MixinHeadComponent);
    }
  }, {
    key: 'mixinMain',
    value: function mixinMain(MixinMainComponent) {
      mixinMainComponents.push(MixinMainComponent);
    }
  }]);
  return Document;
}(_react.Component);

Document.childContextTypes = {
  _documentProps: _propTypes2.default.any
};
exports.default = Document;