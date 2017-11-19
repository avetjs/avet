#!/usr/bin/env node

const path = require('path');
const debug = require('debug')('avet-bin:build-app');

const options = JSON.parse(process.argv[2]);

debug('build app options: %j', options);

const { buildApp } = require(path.join(options.framework, 'index.js'));

buildApp(options);
