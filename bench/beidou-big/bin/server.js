'use strict'; // eslint-disable-line
const path = require('path');

const beidou = require('beidou-core');

beidou.startCluster({
  port: 3000,
  baseDir: path.join(__dirname, '..'),
  workers: 1,
});
