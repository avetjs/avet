const path = require('path');

exports.keys = 'test key';

exports.app = {
  dev: true,
  dir: path.join(__dirname, '..', 'web'),
};
