import * as is from 'is-type-of';
import * as path from 'path';
import * as fs from 'fs';

export function loadFile(filepath) {
    try {
      // if not js module, just return content buffer
      const extname = path.extname(filepath);
      if (![ '.js', '.node', '.json', '' ].includes(extname)) {
        return fs.readFileSync(filepath);
      }
      // require js module
      const obj = require(filepath);
      if (!obj) return obj;
      // it's es module
      if (obj.__esModule) return 'default' in obj ? obj.default : obj;
      return obj;
    } catch (err) {
      err.message = `[avet-core] load file: ${filepath}, error: ${err.message}`;
      throw err;
    }
  }

export function resolveModule(filepath) {
  try {
    return require.resolve(filepath);
  } catch (e) {
    return undefined;
  }
}

export async function callFn(fn, args) {
  args = args || [];
  if (!is.function(fn)) return;
  const r = fn(...args);
  if (is.promise(r)) {
    return await r;
  }
  return r;
}

function sequence(tasks, names, results, missing, recursive, nest, optional) {
  names.forEach(function(name) {
    if (results.indexOf(name) !== -1) {
      return; // de-dup results
    }
    const node = tasks[name];
    // if it's an optional dependency, it can be ignore when
    if (optional === true) {
      // name is not exist
      if (!node) return;
      // or it's disabled
      if (node && node.enable === false) return;
    }

    if (!node) {
      missing.push(name);
    } else if (nest.indexOf(name) > -1) {
      nest.push(name);
      recursive.push(nest.slice(0));
      nest.pop(name);
    } else if (node.dependencies.length || node.optionalDependencies.length) {
      nest.push(name);
      if (node.dependencies.length) {
        sequence(tasks, node.dependencies, results, missing, recursive, nest);
      }
      if (node.optionalDependencies.length) {
        sequence(tasks, node.optionalDependencies, results, missing, recursive, nest, true);
      }
      nest.pop(name);
    }
    results.push(name);
  });
}

// tasks: object with keys as task names
// names: array of task names
export function sequencify(tasks, names) {
  let results = []; // the final sequence
  const missing = []; // missing tasks
  const recursive = []; // recursive task dependencies

  sequence(tasks, names, results, missing, recursive, []);

  if (missing.length || recursive.length) {
    results = []; // results are incomplete at best, completely wrong at worst, remove them to avoid confusion
  }

  return {
    sequence: results,
    missingTasks: missing,
    recursiveDependencies: recursive,
  };
};