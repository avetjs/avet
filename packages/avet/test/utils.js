/* global browser */

const fs = require('fs');
const path = require('path');
const http = require('http');
const qs = require('querystring');
const { fork } = require('child_process');
const mm = require('egg-mock');
const urllib = require('urllib');

const fixtures = path.join(__dirname, 'fixtures');
const avetPath = path.join(__dirname, '..');

function formatOptions(name, options = {}) {
  let baseDir;
  if (typeof name === 'string') {
    baseDir = name;
  } else {
    options = name;
  }
  return Object.assign(
    {},
    {
      baseDir: exports.getFilepath(baseDir),
      framework: avetPath,
      // cache: false,
    },
    options
  );
}

let serverUrl;

exports.startApp = async name => {
  const baseDir = exports.getFilepath(name);
  const cwd = path.resolve(__dirname, '../');
  const port = 7001;

  return new Promise((resolve, reject) => {
    const instance = fork(
      'node_modules/.bin/avet-bin',
      [ 'dev', '--baseDir', baseDir, '--port', port ],
      { cwd, env: { NODE_ENV: 'development' }, silent: true }
    );

    function handleStdout(data) {
      const message = data.toString();
      if (/avet started/.test(message)) {
        serverUrl = `http://127.0.0.1:${port}`;
        resolve({
          instance,
          url: serverUrl,
        });
      }
      // process.stdout.write(message);
    }

    function handleStderr() {
      // process.stderr.write(data.toString());
    }

    instance.stdout.on('data', handleStdout);
    instance.stderr.on('data', handleStderr);

    instance.on('close', () => {
      instance.stdout.removeListener('data', handleStdout);
      instance.stderr.removeListener('data', handleStderr);
    });

    instance.on('error', err => {
      reject(err);
    });
  });
};

exports.mockServer = (name, options) => {
  options = formatOptions(name, options);
  return mm.cluster(options);
};

let localServer;

exports.startLocalServer = () => {
  return new Promise((resolve, reject) => {
    if (localServer) {
      return resolve(serverUrl);
    }

    localServer = http.createServer((req, res) => {
      req.resume();
      req.on('end', () => {
        res.statusCode = 200;
        if (req.url === '/get_headers') {
          res.setHeader('Content-Type', 'json');
          res.end(JSON.stringify(req.headers));
        } else if (req.url === '/timeout') {
          setTimeout(() => {
            res.end(`${req.method} ${req.url}`);
          }, 10000);
        } else {
          res.end(`${req.method} ${req.url}`);
        }
      });
    });

    localServer.listen(0, err => {
      if (err) return reject(err);

      serverUrl = `http://127.0.0.1:${localServer.address().port}`;
      return resolve(serverUrl);
    });
  });
};

process.once('exit', () => localServer && localServer.close());

exports.getFilepath = name => {
  return path.join(fixtures, name);
};

exports.getJSON = name => {
  const pkg = fs.readFileSync(exports.getFilepath(name), 'utf8');
  return JSON.parse(pkg);
};

exports.renderPage = async (path, query = {}) => {
  const page = await browser.newPage();
  await page.goto(`${serverUrl}${path}?${qs.stringify(query)}`);
  return page;
};

exports.curl = async (path, params = {}) => {
  const options = Object.assign(params, { timeout: 10000 });
  return await urllib.request(path, options);
};
