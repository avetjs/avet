'use strict';

var _ = require('./');

var avet = _interopRequireWildcard(_);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

window.avet = avet;

(0, avet.default)().catch(function (err) {
  console.error(err.message + '\n' + err.stack);
});