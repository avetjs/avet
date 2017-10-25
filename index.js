'use strict';

const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const AvetCore = require('./dist/avet').default;
const AVET_PATH = Symbol.for('avet#avetPath');

const { strUpperCamelize } = require('./common/utils');
const writeFile = promisify(fs.writeFile);

const Taskr = require('taskr');

class Application extends AvetCore {
  constructor(options) {
    super(options);

    try {
      this.loader.loadConfig();
      this.loader.load();
    } catch (e) {
      throw e;
    }

    this.hasInit = false;
  }

  async ready(cb) {
    await this._initApp();
    cb && cb();
  }

  async _initApp() {
    if (this.hasInit) return null;

    await generatePluginInfomation(
      this.config.server.dir,
      this.config.build.distDir,
      this.extends,
    );

    this.hasInit = true;
  }

  get [AVET_PATH]() {
    return path.join(__dirname);
  }
}


async function generatePluginInfomation(dir, distDir, buildextends) {
  let avetExtendList = '';

  const avetExtendPre = 'import React from "react"\n';

  let avetExtendImport = '';
  let avetExtendComponents = '';

  buildextends.mixin.forEach(v => {
    const extendModuleDir = v.path;
    const packageName = strUpperCamelize(v.packageName);
    avetExtendImport += `import ${packageName} from "${extendModuleDir}"\n`;
    avetExtendComponents += `<${packageName}></${packageName}>`;
  });

  avetExtendList = `
export default () => <div>${avetExtendComponents}</div>
  `;

  const pluginDir = 'dist';
  const tmp = path.join(__dirname, '.tmp');
  const tmpPlugin = path.join(tmp, 'plugin.js');
  const distPlugin = path.join(__dirname, 'dist');

  mkdir(tmp);
  mkdir(pluginDir);

  await writeFile(tmpPlugin, avetExtendPre + avetExtendImport + avetExtendList);
  await new Promise((resolve, reject) => {
    try {
      const taskr = new Taskr({
        plugins: [
          require('@taskr/babel'),
          require('@taskr/clear'),
        ],
        tasks: {
          * plugin(f) {
            yield f.source(tmpPlugin).babel({
              presets: [
                require.resolve('babel-preset-env'),
                require.resolve('babel-preset-react'),
              ],
              plugins: [
                require.resolve('babel-plugin-transform-object-rest-spread'),
                require.resolve('babel-plugin-transform-class-properties'),
                require.resolve('babel-plugin-transform-runtime'),
              ],
            }).target(distPlugin);
            yield f.clear(tmp);
          },
          * done() {
            resolve();
          },
        },
      });

      taskr.serial([ 'plugin', 'done' ]);
      taskr.on('task_error', (name, message) => console.error(message));
    } catch (err) {
      console.error(err.stack);
      reject(err);
    }
  });
}

const pathSeparatorRe = /[\/\\]/g;

function exists() {
  const filepath = path.join.apply(path, arguments);
  return fs.existsSync(filepath);
}

function mkdir(dirpath, mode) {
  if (mode == null) {
    mode = parseInt('0777', 8) & (~process.umask());
  }
  dirpath.split(pathSeparatorRe).reduce(function(parts, part) {
    parts += part + '/';
    const subpath = path.resolve(parts);
    if (!exists(subpath)) {
      try {
        fs.mkdirSync(subpath, mode);
      } catch (e) {
        throw new Error('Unable to create directory "' + subpath + '" (Error code: ' + e.code + ').', e);
      }
    }
    return parts;
  }, '');
}

module.exports = Application;
