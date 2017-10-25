import * as path from 'path';

export default (moduleName, dir) => {
  return path.resolve(dir, moduleName);
}