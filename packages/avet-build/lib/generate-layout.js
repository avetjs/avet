const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const Taskr = require('taskr');
const { strUpperCamelize } = require('avet-utils');
const relative = require('relative');

const writeFile = promisify(fs.writeFile);
const rimraf = promisify(require('rimraf'));

module.exports = async function(appConfig, layouts) {
  const config = Object.assign({}, appConfig);

  // delete private config
  delete config.build;
  delete config.app;

  await createLayout(config, layouts);
};

async function createLayout(config, layouts) {
  const tmpDir = path.resolve(__dirname, '..', '.temp');
  mkdir(tmpDir);
  const distDir = path.resolve(__dirname, '..', '.external');

  await createConfig(config, tmpDir, distDir);
  await createMixin(layouts, tmpDir, distDir);

  await rimraf(tmpDir);
}

async function createConfig(config, tmpDir, distDir) {
  const content = `
    export default ${JSON.stringify(config, null, 2)}
  `;

  const tmpPlugin = path.join(tmpDir, 'config.js');
  await writeFile(tmpPlugin, content);
  await compileFile(tmpPlugin, distDir);
}

async function createMixin(layouts, tmpDir, distDir) {
  let avetImport = '';
  let avetContent = '';
  let avetExport = '';

  const tmpPlugin = path.join(tmpDir, 'document.js');

  const avetHead = `
    import React from "react";
    import Document, {
      Html as _Html,
      Head as _Head,
      Body as _Body,
      Main as _Main,
      AvetScript as _AvetScript
    } from "avet-shared/lib/document";
    import Router from "avet-shared/lib/router";

    import config from "../.external/config";
  `;

  layouts.forEach(v => {
    const extendModuleDir = relative(tmpPlugin, v.path);
    const packageName = strUpperCamelize(v.packageName);
    avetImport += `
      import ${packageName} from "${extendModuleDir}";
    `;
  });

  layouts.forEach(v => {
    const packageName = strUpperCamelize(v.packageName);
    avetContent += `
      (function() {
        let pack = ${packageName};

        if (typeof pack === 'function') {
          pack = pack({ config, Router});
        }

        if (pack.html) {
          Document.mixinHtml(pack.html);
        }

        if (pack.head) {
          Document.mixinHead(pack.head);
        }

        if (pack.main) {
          Document.mixinMain(pack.main);
        }
      })();
    `;
  });

  avetExport = `
export const Html = _Html;
export const Head = _Head;
export const Body = _Body;
export const Main = _Main;
export const AvetScript = _AvetScript;
export default Document;
  `;

  const content = avetHead + avetImport + avetContent + avetExport;
  await writeFile(tmpPlugin, content);
  await compileFile(tmpPlugin, distDir);
}

async function compileFile(filepath, distDir) {
  await new Promise((resolve, reject) => {
    try {
      const taskr = new Taskr({
        plugins: [ require('@taskr/babel'), require('@taskr/clear') ],
        tasks: {
          *plugin(f) {
            yield f
              .source(filepath)
              .babel({
                presets: [
                  require.resolve('babel-preset-env'),
                  require.resolve('babel-preset-react'),
                ],
                plugins: [
                  require.resolve('babel-plugin-transform-object-rest-spread'),
                  require.resolve('babel-plugin-transform-class-properties'),
                  require.resolve('babel-plugin-transform-runtime'),
                ],
              })
              .target(distDir);
          },
          *done() {
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

function exists(...args) {
  const filepath = path.join(...args);
  return fs.existsSync(filepath);
}

function mkdir(dirpath, mode) {
  if (mode == null) {
    mode = 0o0777 & ~process.umask();
  }
  dirpath.split(pathSeparatorRe).reduce((parts, part) => {
    parts += `${part}/`;
    const subpath = path.resolve(parts);
    if (!exists(subpath)) {
      try {
        fs.mkdirSync(subpath, mode);
      } catch (e) {
        throw new Error(
          `Unable to create directory "${subpath}" (Error code: ${e.code}).`,
          e
        );
      }
    }
    return parts;
  }, '');
}
