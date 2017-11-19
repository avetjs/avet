module.exports = moduleRequire => path => {
  const absolutePath = moduleRequire
    .resolve(path)
    .replace(/[\\/]package\.json$/, '');

  return absolutePath;
};
