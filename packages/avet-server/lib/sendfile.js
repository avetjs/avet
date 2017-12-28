const crypto = require('crypto');
const fs = require('mz/fs');
const zlib = require('mz/zlib');
const mime = require('mime-types');
const compressible = require('compressible');

const files = new FileManager();

async function sendfile(ctx, filepath, options = {}) {
  // decode for `/%E4%B8%AD%E6%96%87`
  // normalize for `//index`
  let file = files.get(filepath);

  // try to load file
  if (!file) {
    const s = await fs.stat(filepath);
    if (!s.isFile()) {
      throw Error('file not found');
    }

    file = loadFile(filepath, options, files);
  }

  ctx.status = 200;

  if (options.enableGzip) ctx.vary('Accept-Encoding');

  if (!file.buffer) {
    const stats = await fs.stat(file.path);
    if (stats.mtime > file.mtime) {
      file.mtime = stats.mtime;
      file.md5 = null;
      file.length = stats.size;
    }
  }

  ctx.response.lastModified = file.mtime;
  if (file.md5) ctx.response.etag = file.md5;

  if (ctx.fresh) {
    ctx.status = 304;
    return;
  }

  ctx.type = file.type;
  ctx.length = file.zipBuffer ? file.zipBuffer.length : file.length;
  ctx.set(
    'cache-control',
    file.cacheControl || `public, max-age=${file.maxAge}`
  );
  if (file.md5) ctx.set('content-md5', file.md5);

  if (ctx.method === 'HEAD') return;

  const acceptGzip = ctx.acceptsEncodings('gzip') === 'gzip';

  if (file.zipBuffer) {
    if (acceptGzip) {
      ctx.set('content-encoding', 'gzip');
      ctx.body = file.zipBuffer;
    } else {
      ctx.body = file.buffer;
    }
    return;
  }

  const shouldGzip =
    options.enableGzip &&
    file.length > 1024 &&
    acceptGzip &&
    compressible(file.type);

  if (file.buffer) {
    if (shouldGzip) {
      const gzFile = files.get(`${filepath}.gz`);
      if (options.usePrecompiledGzip && gzFile && gzFile.buffer) {
        // if .gz file already read from disk
        file.zipBuffer = gzFile.buffer;
      } else {
        file.zipBuffer = await zlib.gzip(file.buffer);
      }
      ctx.set('content-encoding', 'gzip');
      ctx.body = file.zipBuffer;
    } else {
      ctx.body = file.buffer;
    }
    return;
  }

  const stream = fs.createReadStream(file.path);

  // update file hash
  if (!file.md5) {
    const hash = crypto.createHash('md5');
    stream.on('data', hash.update.bind(hash));
    stream.on('end', () => {
      file.md5 = hash.digest('base64');
    });
  }

  ctx.body = stream;
  // enable gzip will remove content length
  if (shouldGzip) {
    ctx.remove('content-length');
    ctx.set('content-encoding', 'gzip');
    ctx.body = stream.pipe(zlib.createGzip());
  }
}

// function safeDecodeURIComponent(text) {
//   try {
//     return decodeURIComponent(text);
//   } catch (e) {
//     return text;
//   }
// }

/**
 * load file and add file content to cache
 *
 * @param {String} filepath
 * @param {Object} options
 * @param {Object} files
 * @return {Object}
 * @api private
 */

function loadFile(filepath, options, files) {
  if (!files.get(filepath)) files.set(filepath, {});
  const obj = files.get(filepath);
  const filename = (obj.path = filepath);
  const stats = fs.statSync(filename);
  let buffer = fs.readFileSync(filename);

  obj.cacheControl = options.cacheControl;
  obj.maxAge = obj.maxAge ? obj.maxAge : options.maxAge || 0;
  obj.type = obj.mime = mime.lookup(filepath) || 'application/octet-stream';
  obj.mtime = stats.mtime;
  obj.length = stats.size;
  obj.md5 = crypto
    .createHash('md5')
    .update(buffer)
    .digest('base64');

  if (options.buffer) obj.buffer = buffer;

  buffer = null;
  return obj;
}

function FileManager(store) {
  if (
    store &&
    typeof store.set === 'function' &&
    typeof store.get === 'function'
  ) {
    this.store = store;
  } else {
    this.map = store || Object.create(null);
  }
}

FileManager.prototype.get = function(key) {
  return this.store ? this.store.get(key) : this.map[key];
};

FileManager.prototype.set = function(key, value) {
  if (this.store) return this.store.set(key, value);
  this.map[key] = value;
};

module.exports = sendfile;
