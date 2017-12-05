const relativeResolve = require('../root-module-relative-path')(require);
const absoluteResolve = require('../absolute-path')(require);

const envPlugins = {
  development: [ require.resolve('babel-plugin-transform-react-jsx-source') ],
  production: [
    require.resolve('babel-plugin-transform-react-remove-prop-types'),
  ],
};

const plugins = envPlugins[process.env.NODE_ENV] || envPlugins.development;

module.exports = (context, opts = {}) => {
  return {
    presets: [
      [
        require.resolve('babel-preset-env'),
        {
          modules: false,
        },
      ],
      require.resolve('babel-preset-react'),
    ],
    plugins: [
      require.resolve('babel-plugin-react-require'),
      require.resolve('./plugins/handle-import'),
      require.resolve('babel-plugin-transform-object-rest-spread'),
      require.resolve('babel-plugin-transform-class-properties'),
      [
        require.resolve('babel-plugin-transform-runtime'),
        opts['transform-runtime'] || {},
      ],
      ...plugins,
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          alias: {
            'babel-runtime': relativeResolve('babel-runtime/package'),
            'avet/link': relativeResolve('avet-shared/lib/link'),
            'avet/prefetch': relativeResolve('avet-shared/lib/prefetch'),
            'avet/dynamic': relativeResolve('avet-shared/lib/dynamic'),
            'avet/head': relativeResolve('avet-shared/lib/head'),
            'avet/router': relativeResolve('avet-shared/lib/router'),
            'avet/error': relativeResolve('avet-shared/lib/error'),
            'avet/document': relativeResolve('../../.external/document'),
            'avet/config': relativeResolve('../../.external/config'),
          },
        },
      ],
    ],
  };
};
