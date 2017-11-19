#!/usr/bin/env node

const path = require('path');
const debug = require('debug')('avet-bin:start-app');

const options = JSON.parse(process.argv[2]);

debug('start app options: %j', options);

const { startApp } = require(path.join(options.framework, 'index.js'));

startApp(options);
