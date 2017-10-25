import { sep } from 'path'

export default (moduleRequire) => (path) => {
  const absolutePath = moduleRequire.resolve(path)
    .replace(/[\\/]package\.json$/, '');

  return absolutePath
}
