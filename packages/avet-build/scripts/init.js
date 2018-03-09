const fs = require('fs');
const path = require('path');

const configCode = `
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  "styledJsx": {
    "postcss": {
      "plugins": {
        "lost": [null, {}],
        "postcss-nested": [null, {}]
      }
    }
  },
  "assets": {
    "extensions": ["txt", "svg", "png", "jpg", "jpeg", "webp", "gif"],
    "regExp": ".*/static/(.+)",
    "name": "/static/[1]?[sha512:hash:base64:7]"
  },
  "theme": {
    "cookieKey": "avetTheme",
    "styles": {
      "common": {},
      "default": {}
    }
  }
};
`;

const documentCode = `
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AvetScript = exports.Main = exports.Body = exports.Head = exports.Html = undefined;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _document = require("avet-shared/lib/document");

var _document2 = _interopRequireDefault(_document);

var _router = require("avet-shared/lib/router");

var _router2 = _interopRequireDefault(_router);

var _config = require("../.external/config");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Html = exports.Html = _document.Html;
var Head = exports.Head = _document.Head;
var Body = exports.Body = _document.Body;
var Main = exports.Main = _document.Main;
var AvetScript = exports.AvetScript = _document.AvetScript;
exports.default = _document2.default;
`;

const foleder = path.join(__dirname, '..', '.external');
if (!fs.existsSync(foleder)) {
  fs.mkdirSync(foleder, '0777');
}

fs.writeFileSync(path.join(foleder, 'config.js'), configCode, 'utf8');
fs.writeFileSync(path.join(foleder, 'document.js'), documentCode, 'utf8');
