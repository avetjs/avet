'use strict';

const path = require('path');
const assert = require('assert');
const fs = require('fs');

const initCwd = process.cwd();
const cache = new Map();

const defaultConfig = {
  webpack: null,
  webpackDevMiddleware: null,
  poweredByHeader: true,
  distDir: '.avet',
  assetPrefix: '',
  configOrigin: 'default',
  useFileSystemPublicRoutes: true,
};

exports.getFrameworkPath = function({ framework, baseDir }) {
  const pkgPath = path.join(baseDir, 'package.json');
  assert(fs.existsSync(pkgPath), `${pkgPath} should exist`);

  const moduleDir = path.join(baseDir, 'node_modules');
  const pkg = require(pkgPath);

  if (framework) {
    // 1.1 framework is an absolute path
    // framework: path.join(baseDir, 'node_modules/${frameworkName}')
    if (path.isAbsolute(framework)) {
      assert(fs.existsSync(framework), `${framework} should exist`);
      return framework;
    }
    // 1.2 framework is a npm package that required by application
    // framework: 'frameworkName'
    return assertAndReturn(framework, moduleDir);
  }

  // 2. framework is not specified
  // 2.1 use framework name from pkg.avet.framework
  if (pkg.avet && pkg.avet.framework) {
    return assertAndReturn(pkg.avet.framework, moduleDir);
  }

  // 2.2 use avet by default
  return assertAndReturn('avet', moduleDir);
};

function assertAndReturn(frameworkName, moduleDir) {
  const moduleDirs = new Set([
    moduleDir,
    // find framework from process.cwd, especially for test,
    // the application is in test/fixtures/app,
    // and framework is install in ${cwd}/node_modules
    path.join(process.cwd(), 'node_modules'),
    // prevent from mocking process.cwd
    path.join(initCwd, 'node_modules'),
  ]);
  for (const moduleDir of moduleDirs) {
    const frameworkPath = path.join(moduleDir, frameworkName);
    if (fs.existsSync(frameworkPath)) return frameworkPath;
  }
  throw new Error(`${frameworkName} is not found in ${Array.from(moduleDirs)}`);
}

exports.getConfig = function(dir, customConfig) {
  if (!cache.has(dir)) {
    cache.set(dir, loadConfig(dir, customConfig));
  }
  return cache.get(dir);
};

function loadConfig(dir, customConfig) {
  if (customConfig && typeof customConfig === 'object') {
    customConfig.configOrigin = 'server';
    return Object.assign({}, customConfig);
  }
  const configDir = path.join(dir, 'avet.config.js');

  let userConfig = {};

  const userHasConfig = fs.existsSync(configDir);
  if (userHasConfig) {
    const userConfigModule = require(configDir);
    userConfig = userConfigModule.default || userConfigModule;
    userConfig.configOrigin = 'avet.config.js';
  }

  return withDefaults(userConfig);
}

function withDefaults(config) {
  return Object.assign({}, defaultConfig, config);
}

exports.printAndExit = function(message, code = 1) {
  if (code === 0) {
    console.log(message);
  } else {
    console.error(message);
  }

  process.exit(code);
};

exports.strUpperCamelize = function(str) {
  const property = str.replace(/[_-][a-z]/ig, s => s.substring(1).toUpperCase());
  let first = property[0];
  first = first.toUpperCase();
  return first + property.substring(1);
};
