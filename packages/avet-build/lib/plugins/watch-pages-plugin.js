const { resolve, join } = require('path');

module.exports = class WatchPagesPlugin {
  constructor(dir) {
    this.dir = resolve(dir, 'page');
  }

  apply(compiler) {
    compiler.plugin('compilation', compilation => {
      compilation.plugin('optimize-assets', (assets, callback) => {
        // transpile page/_document.js and descendants,
        // but don't need the bundle file
        delete assets[join('bundles', 'page', '_document.js')];
        callback();
      });
    });

    compiler.plugin('emit', (compilation, callback) => {
      // watch the page directory
      compilation.contextDependencies = [
        ...compilation.contextDependencies,
        this.dir,
      ];
      callback();
    });
  }
};
