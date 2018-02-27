const aliasModules = require('../alias-modules');

const envPlugins = {
  development: [ require.resolve('babel-plugin-transform-react-jsx-source') ],
  production: [
    require.resolve('babel-plugin-transform-react-remove-prop-types'),
  ],
};

const plugins = envPlugins[process.env.NODE_ENV] || envPlugins.development;

module.exports = (opts = {}) => {
  return {
    presets: [
      require.resolve('babel-preset-es2015'),
      [
        require.resolve('babel-preset-env'),
        {
          targets: {
            browsers: '>1%',
          },
          modules: false,
        },
      ],
      require.resolve('babel-preset-react'),
    ],
    plugins: [
      require.resolve('./plugins/remove-dotjsx-from-import'),
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
          alias: aliasModules,
        },
      ],
    ],
  };
};
