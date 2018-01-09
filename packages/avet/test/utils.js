/* global browser */

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as qs from 'querystring';
import mm from 'egg-mock';

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
      baseDir: getFilepath(baseDir),
      framework: avetPath,
      cache: false,
    },
    options
  );
}

export const app = (name, options) => {
  options = formatOptions(name, options);
  return mm.app(options);
};

let localServer;

export const startLocalServer = () => {
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

export const getFilepath = (name: string) => {
  return path.join(fixtures, name);
};

export const getJSON = (name: string) => {
  const pkg = fs.readFileSync(getFilepath(name), 'utf8');
  return JSON.parse(pkg);
};

export async function newPage(path, query = {}): Promise<string> {
  console.log('##########', path);
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:7001${path}?${qs.stringify(query)}`);
  return page;
}
