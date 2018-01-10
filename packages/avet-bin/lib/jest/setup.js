const { JSDOM } = require('jsdom');

if (typeof window === 'undefined') {
  const documentHTML =
    '<!doctype html><html><body><div id="root"></div></body></html>';
  const { window } = new JSDOM(documentHTML);
  global.window = window;
  global.document = window.document;
  global.navigator = window.navigator;
}

global.requestAnimationFrame =
  global.requestAnimationFrame ||
  function(cb) {
    return setTimeout(cb, 0);
  };

const Enzyme = require('enzyme');

let Adapter;
if (process.env.REACT === '15') {
  Adapter = require('enzyme-adapter-react-15');
} else {
  Adapter = require('enzyme-adapter-react-16');
}

Enzyme.configure({ adapter: new Adapter() });
