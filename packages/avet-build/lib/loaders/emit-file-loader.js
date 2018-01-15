const loaderUtils = require('loader-utils');

module.exports = function(content, sourceMap) {
  this.cacheable();

  const callback = this.async();
  const { resourcePath } = this;

  const query = loaderUtils.getOptions(this);

  // Allows you to do checks on the file name. For example it's used to check if there's both a .js and .jsx file.
  if (query.validateFileName) {
    try {
      query.validateFileName(resourcePath);
    } catch (err) {
      callback(err);
      return;
    }
  }

  const name = query.name || '[hash].[ext]';
  const context = query.context || this.options.context;
  const { regExp } = query;
  const opts = { context, content, regExp };
  const interpolateName = query.interpolateName || (name => name);
  const interpolatedName = interpolateName(
    loaderUtils.interpolateName(this, name, opts),
    { name, opts }
  );

  const emit = (code, map) => {
    this.emitFile(interpolatedName, code, map);
    this.callback(null, code, map);
  };

  if (query.transform) {
    const transformed = query.transform({
      content,
      sourceMap,
      interpolatedName,
    });
    return emit(transformed.content, transformed.sourceMap);
  }

  return emit(content, sourceMap);
};
