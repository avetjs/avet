const assert = require('assert');
const fs = require('fs');
const debug = require('debug')('common:fileloader');
const path = require('path');
const globby = require('globby');
const is = require('is-type-of');

const FULLPATH = Symbol('EGG_LOADER_ITEM_FULLPATH');
const EXPORTS = Symbol('EGG_LOADER_ITEM_EXPORTS');

const defaults = {
  directory: null,
  target: null,
  match: undefined,
  ignore: undefined,
  lowercaseFirst: false,
  caseStyle: 'camel',
  initializer: null,
  call: true,
  override: false,
  filter: null,
};

/**
 * Load files from directory to target object.
 * @since 1.0.0
 */
class FileLoader {
  /**
   * @constructor
   * @param {Object} options - options
   * @param {String|Array} options.directory - directories to be loaded
   * @param {Object} options.target - attach the target object from loaded files
   * @param {String} options.match - match the files when load, support glob, default to all js files
   * @param {String} options.ignore - ignore the files when load, support glob
   * @param {Function} options.initializer - custom file exports, receive two parameters, first is the inject object(if not js file, will be content buffer), second is an `options` object that contain `path`
   * @param {Boolean} options.call - determine whether invoke when exports is function
   * @param {Boolean} options.override - determine whether override the property when get the same name
   * @param {Function} options.filter - a function that filter the exports which can be loaded
   * @param {String|Function} options.caseStyle - set property's case when converting a filepath to property list.
   */
  constructor(options) {
    assert(options.directory, 'options.directory is required');
    assert(options.target, 'options.target is required');
    this.options = Object.assign({}, defaults, options);

    // compatible old options _lowercaseFirst_
    if (this.options.lowercaseFirst === true) {
      this.options.caseStyle = 'lower';
    }
  }

  /**
   * Parse files from given directories, then return an items list, each item contains properties and exports.
   *
   * For example, parse `app/controller/group/repository.js`
   *
   * ```
   * module.exports = app => {
   *   return class RepositoryController extends app.Controller {};
   * }
   * ```
   *
   * It returns a item
   *
   * ```
   * {
   *   properties: [ 'group', 'repository' ],
   *   exports: app => { ... },
   * }
   * ```
   *
   * `Properties` is an array that contains the directory of a filepath.
   *
   * `Exports` depends on type, if exports is a function, it will be called. if initializer is specified, it will be called with exports for customizing.
   * @return {Array} items
   * @since 1.0.0
   */
  parse() {
    let files = this.options.match || [ '**/*.js' ];
    files = Array.isArray(files) ? files : [ files ];

    let ignore = this.options.ignore;
    if (ignore) {
      ignore = Array.isArray(ignore) ? ignore : [ ignore ];
      ignore = ignore.filter(f => !!f).map(f => '!' + f);
      files = files.concat(ignore);
    }

    let directories = this.options.directory;
    if (!Array.isArray(directories)) {
      directories = [ directories ];
    }

    const items = [];
    debug('parsing %j', directories);
    for (const directory of directories) {
      const filepaths = globby.sync(files, { cwd: directory });
      for (const filepath of filepaths) {
        const fullpath = path.join(directory, filepath);
        if (!fs.statSync(fullpath).isFile()) continue;
        // get properties
        // app/service/foo/bar.js => [ 'foo', 'bar' ]
        const properties = getProperties(filepath, this.options);
        // app/service/foo/bar.js => service.foo.bar
        const pathName =
          directory.split(/\/|\\/).slice(-1) + '.' + properties.join('.');

        items.push({ fullpath, properties, pathName });
        debug(
          'parse %s, properties %j, export %j',
          fullpath,
          properties,
          pathName
        );
      }
    }

    return items;
  }
}

module.exports = FileLoader;
module.exports.EXPORTS = EXPORTS;
module.exports.FULLPATH = FULLPATH;

// convert file path to an array of properties
// a/b/c.js => ['a', 'b', 'c']
function getProperties(filepath, { caseStyle }) {
  // if caseStyle is function, return the result of function
  if (is.function(caseStyle)) {
    const result = caseStyle(filepath);
    assert(is.array(result), `caseStyle expect an array, but got ${result}`);
    return result;
  }
  // use default camelize
  return defaultCamelize(filepath, caseStyle);
}

function defaultCamelize(filepath, caseStyle) {
  const properties = filepath
    .substring(0, filepath.lastIndexOf('.'))
    .split('/');

  return properties.map(property => {
    if (!/^[a-z][a-z0-9_-]*$/i.test(property)) {
      throw new Error(`${property} is not match 'a-z0-9_-' in ${filepath}`);
    }

    // use default camelize, will capitalize the first letter
    // foo_bar.js > FooBar
    // fooBar.js  > FooBar
    // FooBar.js  > FooBar
    // FooBar.js  > FooBar
    // FooBar.js  > fooBar (if lowercaseFirst is true)
    property = property.replace(/[_-][a-z]/gi, s =>
      s.substring(1).toUpperCase()
    );
    let first = property[0];
    switch (caseStyle) {
      case 'lower':
        first = first.toLowerCase();
        break;
      case 'upper':
        first = first.toUpperCase();
        break;
      case 'camel':
      default:
    }
    return first + property.substring(1);
  });
}
