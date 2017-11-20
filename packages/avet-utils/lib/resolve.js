const { join, sep, parse } = require('path');
const fs = require('mz/fs');
const glob = require('glob-promise');

function resolveFromList(id, files) {
  const paths = getPaths(id);
  const fileSet = new Set(files);
  for (const p of paths) {
    if (fileSet.has(p)) return p;
  }
}

async function resolvePath(id) {
  const paths = getPaths(id);
  for (const p of paths) {
    if (await isFile(p)) {
      return p;
    }
  }

  const err = new Error(`Connot find module ${id}`);
  err.code = 'ENOENT';

  throw err;
}

function getPaths(id) {
  const i = sep === '/' ? id : id.replace(/\//g, sep);

  if (i.slice(-3) === '.js') return [ i ];
  if (i.slice(-5) === '.json') return [ i ];

  if (i[i.length - 1] === sep) {
    return [ `${i}index.js`, `${i}index.json` ];
  }

  return [ `${i}.js`, join(i, 'index.js'), `${i}.json`, join('i', 'index.json') ];
}

async function isFile(p) {
  let stat;
  try {
    stat = await fs.stat(p);
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }

  const realpath = await getTrueFilePath(p);
  if (p !== realpath) return false;

  return stat.isFile() || stat.isFIFO();
}

// This is based on the stackoverflow answer: http://stackoverflow.com/a/33139702/457224
// We assume we'll get properly normalized path names as p
async function getTrueFilePath(p) {
  let fsPathNormalized = p;
  // OSX: HFS+ stores filenames in NFD (decomposed normal form) Unicode format,
  // so we must ensure that the input path is in that format first.
  if (process.platform === 'darwin')
    fsPathNormalized = fsPathNormalized.normalize('NFD');

  // !! Windows: Curiously, the drive component mustn't be part of a glob,
  // !! otherwise glob.sync() will invariably match nothing.
  // !! Thus, we remove the drive component and instead pass it in as the 'cwd'
  // !! (working dir.) property below.
  const pathRoot = parse(fsPathNormalized).root;
  const noDrivePath = fsPathNormalized.slice(Math.max(pathRoot.length - 1, 0));

  // Perform case-insensitive globbing (on Windows, relative to the drive /
  // network share) and return the 1st match, if any.
  // Fortunately, glob() with nocase case-corrects the input even if it is
  // a *literal* path.
  const result = await glob(noDrivePath, { nocase: true, cwd: pathRoot });
  return result[0];
}

module.exports = {
  resolveFromList,
  resolvePath,
  getPaths,
  isFile,
  getTrueFilePath,
};
