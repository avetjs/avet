/* global browser */

const fs = require('fs');
const path = require('path');
const http = require('http');
const qs = require('querystring');
const { spawn } = require('child_process');
const mm = require('egg-mock');

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
      cache: false,
    },
    options
  );
}

exports.buildApp = async name => {
  const baseDir = exports.getFilepath(name);
  const cwd = path.resolve(__dirname, '../');

  return new Promise((resolve, reject) => {
    const instance = spawn(
      'node',
      [ 'node_modules/.bin/avet-bin', 'build', '--baseDir', baseDir ],
      { cwd }
    );

    function handleStdout(data) {
      const message = data.toString();
      if (/done/.test(message)) {
        resolve(instance);
      }
      process.stdout.write(message);
    }

    function handleStderr(data) {
      process.stderr.write(data.toString());
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

exports.mockApp = (name, options) => {
  options = formatOptions(name, options);
  return mm.app(options);
};

let localServer;

exports.startLocalServer = () => {
  return new Promise((resolve, reject) => {
    if (localServer) {
      return resolve(`http://127.0.0.1:${localServer.address().port}`);
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

    localServer.listen(7001, err => {
      if (err) return reject(err);
      return resolve(`http://127.0.0.1:${localServer.address().port}`);
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
  await page.goto(`http://127.0.0.1:7001${path}?${qs.stringify(query)}`);
  return page;
};
