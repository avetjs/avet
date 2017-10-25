const { strUpperCamelize } = require('../../../common/utils');

const relativeResolve = require('../root-module-relative-path').default(require);
const absoluteResolve = require('../absolute-path').default(require);

const moduleAliasPath = require('../module-alias-path').default;

const envPlugins = {
  development: [
    require.resolve('babel-plugin-transform-react-jsx-source')
  ],
  production: [
    require.resolve('babel-plugin-transform-react-remove-prop-types'),
  ],
};

const plugins = envPlugins[process.env.NODE_ENV] || envPlugins.development;

module.exports = ({ dir, config, buildExtends }) => {
  return {
    presets: [
      [
        require.resolve('babel-preset-env'),
        {
          modules: 'commonjs',
        },
      ],
      require.resolve('babel-preset-react'),
    ],
    plugins: [
      require.resolve('babel-plugin-react-require'),
      require.resolve('./plugins/handle-import'),
      require.resolve('babel-plugin-transform-object-rest-spread'),
      require.resolve('babel-plugin-transform-class-properties'),
      require.resolve('babel-plugin-transform-runtime'),
      ...plugins,
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          alias: {
            'babel-runtime': absoluteResolve('babel-runtime/package'),
            'react': absoluteResolve('react'),
            'react-dom': absoluteResolve('react-dom'),
            '@link': relativeResolve('../../shared/link'),
            '@dynamic': relativeResolve('../../shared/dynamic'),
            '@head': relativeResolve('../../shared/head'),
            '@document': relativeResolve('../../server/document'),
            '@router': relativeResolve('../../shared/router'),
            '@error': relativeResolve('../../shared/error'),
          },
        },
      ],
    ]
  }
};
