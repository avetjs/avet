'use strict';

const fs = require('fs');
const path = require('path');
const utility = require('utility');

[
  require('./lib/framework'),
  require('./lib/build'),
  require('./lib/resolve'),
  require('./lib/require'),
  require('./lib/component'),
  require('./lib/common'),
  { getFrameworkOrAvetPath },
]
  .forEach(obj => Object.assign(exports, obj));

function getFrameworkOrAvetPath(cwd, avetNames) {
  avetNames = avetNames || [ 'avet' ];
  const moduleDir = path.join(cwd, 'node_modules');
  if (!fs.existsSync(moduleDir)) {
    return '';
  }

  // try to get framework

  // 1. try to read avet.framework property on package.json
  const pkgFile = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgFile)) {
    const pkg = utility.readJSONSync(pkgFile);
    if (pkg.avet && pkg.avet.framework) {
      return path.join(moduleDir, pkg.avet.framework);
    }
  }

  // 2. try the module dependencies includes avetNames
  const names = fs.readdirSync(moduleDir);
  for (const name of names) {
    const pkgfile = path.join(moduleDir, name, 'package.json');
    if (!fs.existsSync(pkgfile)) {
      continue;
    }
    const pkg = utility.readJSONSync(pkgfile);
    if (pkg.dependencies) {
      for (const avetName of avetNames) {
        if (pkg.dependencies[avetName]) {
          return path.join(moduleDir, name);
        }
      }
    }
  }

  // try to get avet
  for (const avetName of avetNames) {
    const pkgfile = path.join(moduleDir, avetName, 'package.json');
    if (fs.existsSync(pkgfile)) {
      return path.join(moduleDir, avetName);
    }
  }

  return '';
}
