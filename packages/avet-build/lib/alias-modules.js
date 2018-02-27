const relativeResolve = require('./root-module-relative-path')(require);

module.exports = {
  'babel-runtime': relativeResolve('babel-runtime/package'),
  'avet/link': relativeResolve('avet-shared/lib/link'),
  'avet/prefetch': relativeResolve('avet-shared/lib/prefetch'),
  'avet/dynamic': relativeResolve('avet-shared/lib/dynamic'),
  'avet/head': relativeResolve('avet-shared/lib/head'),
  'avet/router': relativeResolve('avet-shared/lib/router'),
  'avet/error': relativeResolve('avet-shared/lib/error'),
  'avet/httpclient': relativeResolve('avet-shared/lib/httpclient'),
  'avet/store': relativeResolve('avet-shared/lib/store'),
  'avet/document': relativeResolve('../.external/document'),
  'avet/config': relativeResolve('../.external/config'),
};
