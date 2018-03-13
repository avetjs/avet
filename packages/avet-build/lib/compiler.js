const { existsSync } = require('fs');
const { join, sep } = require('path');
const { createHash } = require('crypto');
const extend = require('extend2');
const webpack = require('webpack');
const glob = require('glob-promise');
const WriteFilePlugin = require('write-file-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
// const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CaseSensitivePathPlugin = require('case-sensitive-paths-webpack-plugin');
const UnlinkFilePlugin = require('./plugins/unlink-file-plugin');
const PagesPlugin = require('./plugins/pages-plugin');
const DynamicChunksPlugin = require('./plugins/dynamic-chunks-plugin');
const CombineAssetsPlugin = require('./plugins/combine-assets-plugin');
const babelCore = require('babel-core');
const generateLayout = require('./generate-layout');
const {
  getPluginNodeBabelAlias,
  getPluginModuleBabelAlias,
} = require('./utils');

const aliasModules = require('./alias-modules');

module.exports = async function createCompiler(
  dir,
  {
    dev = false,
    avetPluginConfig = {},
    buildConfig = {},
    appConfig = {},
    layouts = {},
    plugins = {},
  } = {}
) {
  dir = dir.replace(/\/$/i, '');

  await generateLayout(avetPluginConfig, layouts);

  const pluginNodeBabelAlias = getPluginNodeBabelAlias(plugins);
  const pluginModuleBabelAlias = getPluginModuleBabelAlias(plugins);

  const documentPage = join('page', '_document.js');
  const defaultPages = [ '_error.js', '_document.js' ];
  const avetPagesDir = join(__dirname, 'page');
  const avetNodeModulesDir = join(dir, 'node_modules');
  const interpolateNames = new Map(
    defaultPages.map(p => {
      return [ join(avetPagesDir, p), `dist/page/${p}` ];
    })
  );

  async function getPages({ dir, dev, pagesGlobPattern }) {
    let pages;

    if (dev) {
      pages = await glob('page/+(_document|_error).+(js|jsx)', { cwd: dir });
    } else {
      pages = await glob(pagesGlobPattern, { cwd: dir });
    }

    return pages;
  }

  function getPageEntries(pages) {
    const entries = {};
    for (const p of pages) {
      entries[join('bundles', p.replace('.jsx', '.js'))] = [ `./${p}?entry` ];
    }

    // The default pages (_document.js and _error.js) are only added when they're not provided by the user
    for (const p of defaultPages) {
      const entryName = join('bundles', 'page', p);
      if (!entries[entryName]) {
        entries[entryName] = [ `${join(avetPagesDir, p)}?entry` ];
      }
    }
    return entries;
  }

  const devEntries = dev
    ? [
      require.resolve('avet-client/lib/webpack-hot-middleware-client'),
      require.resolve('avet-client/lib/on-demand-entries-client'),
    ]
    : [];

  const mainJS = dev
    ? require.resolve('avet-client/lib/avet-dev')
    : require.resolve('avet-client/lib/avet');

  let totalPages;

  const entry = async () => {
    const pages = await getPages({
      dir,
      dev,
      pagesGlobPattern: 'page/**/*.js',
    });

    const pageEntries = getPageEntries(pages);
    // Used for commons chunk calculations
    totalPages = pages.length;
    if (pages.indexOf(documentPage) !== -1) {
      totalPages = totalPages - 1;
    }

    const entries = {
      'main.js': [
        ...devEntries, // Adds hot middleware and ondemand entries in development
        mainJS, // Main entrypoint in the client folder
      ],
      ...pageEntries,
    };

    return entries;
  };

  const webpackPlugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        dev ? 'development' : 'production'
      ),
    }),
    new CaseSensitivePathPlugin(),
    new webpack.IgnorePlugin(/(precomputed)/, /node_modules.+(elliptic)/),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: dir,
        customInterpolateName(url) {
          return interpolateNames.get(this.resourcePath) || url;
        },
      },
    }),
    new WriteFilePlugin({
      exitOnErrors: false,
      log: false,
      // required not to cache removed files
      useHashIndex: false,
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      filename: 'commons.js',
      minChunks(module, count) {
        if (
          dev &&
          module.context &&
          module.context.indexOf(`${sep}react${sep}`) >= 0
        ) {
          return true;
        }

        // Move react-dom into commons.js always
        if (
          dev &&
          module.context &&
          module.context.indexOf(`${sep}react-dom${sep}`) >= 0
        ) {
          return true;
        }

        // In the dev we use on-demand-entries.
        // So, it makes no sense to use commonChunks based on the minChunks count.
        // Instead, we move all the code in node_modules into each of the pages.
        if (dev) {
          return false;
        }

        // If there are one or two pages, only move modules to common if they are
        // used in all of the pages. Otherwise, move modules used in at-least
        // 1/2 of the total pages into commons.
        if (totalPages <= 2) {
          return count >= totalPages;
        }
        return count >= totalPages * 0.5;
      },
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'react',
      filename: 'react.js',
      minChunks(module, count) {
        if (dev) {
          return false;
        }

        if (
          module.resource &&
          module.resource.includes(`${sep}react-dom${sep}`) &&
          count >= 0
        ) {
          return true;
        }

        if (
          module.resource &&
          module.resource.includes(`${sep}react${sep}`) &&
          count >= 0
        ) {
          return true;
        }

        return false;
      },
    }),
    // This chunk contains all the webpack related code. So, all the changes
    // related to that happens to this chunk.
    // It won't touch commons.js and that gives us much better re-build perf.
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      filename: 'manifest.js',
    }),
    new PagesPlugin(),
    new DynamicChunksPlugin(),
  ];

  if (dev) {
    webpackPlugins.push(
      new webpack.NoEmitOnErrorsPlugin(),
      new UnlinkFilePlugin()
    );

    if (buildConfig.hotReload) {
      webpackPlugins.push(new webpack.HotModuleReplacementPlugin());
    }

    // if (!appConfig.app.quiet) {
    //   webpackPlugins.push(new FriendlyErrorsWebpackPlugin());
    // }
  } else {
    webpackPlugins.push(new webpack.IgnorePlugin(/react-hot-loader/));
    webpackPlugins.push(
      new UglifyJSPlugin({
        exclude: /react\.js/,
        parallel: true,
        sourceMap: false,
        uglifyOptions: {
          compress: {
            comparisons: false,
          },
        },
      })
    );
    webpackPlugins.push(
      // Combines manifest.js commons.js and main.js into app.js in production
      new CombineAssetsPlugin({
        input: [ 'manifest.js', 'react.js', 'commons.js', 'main.js' ],
        output: 'app.js',
      })
    );
    webpackPlugins.push(new webpack.optimize.ModuleConcatenationPlugin());
  }

  const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(p => !!p);

  // 不会使用 babelrc 配置
  const mainBabelOptions = {
    babelrc: false,
    cacheDirectory: true,
    presets: [],
    plugins: [],
  };

  const bablePreset = require('./babel/preset')();

  mainBabelOptions.presets = bablePreset.presets;
  mainBabelOptions.plugins = bablePreset.plugins;

  // 看插件是否提供 babel 配置
  if (buildConfig.babel) {
    mainBabelOptions.plugins = mainBabelOptions.plugins.concat(
      buildConfig.babel.plugins
    );
  }

  if (pluginModuleBabelAlias) {
    mainBabelOptions.plugins.push(pluginModuleBabelAlias);
  }

  const devLoaders = dev
    ? [
      {
        test: /\.(js|jsx)(\?[^?]*)?$/,
        loader: 'hot-self-accept-loader',
        include: [ join(dir, 'page'), avetPagesDir ],
      },
      {
        test: /\.(js|jsx)(\?[^?]*)?$/,
        loader: require.resolve('react-hot-loader/webpack'),
        exclude: /node_modules/,
      },
    ]
    : [];

  const loaders = [
    {
      test: /\.json$/,
      loader: require.resolve('json-loader'),
    },
    {
      test: /\.(js|jsx|json)(\?[^?]*)?$/,
      loader: 'emit-file-loader',
      include: [ dir, avetPagesDir ],
      exclude(str) {
        return /node_modules/.test(str) && str.indexOf(avetPagesDir) !== 0;
      },
      options: {
        name: 'dist/[path][name].[ext]',
        // We need to strip off .jsx on the server. Otherwise require without .jsx doesn't work.
        interpolateName: name => name.replace('.jsx', '.js'),
        validateFileName(file) {
          const cases = [
            { from: '.js', to: '.jsx' },
            { from: '.jsx', to: '.js' },
          ];

          for (const item of cases) {
            const { from, to } = item;
            if (file.slice(-from.length) !== from) {
              continue;
            }

            const filePath = file.slice(0, -from.length) + to;

            if (existsSync(filePath)) {
              throw new Error(
                `Both ${from} and ${to} file found. Please make sure you only have one of both.`
              );
            }
          }
        },
        // By default, our babel config does not transpile ES2015 module syntax because
        // webpack knows how to handle them. (That's how it can do tree-shaking)
        // But Node.js doesn't know how to handle them. So, we have to transpile them here.
        transform({ content, sourceMap, interpolatedName }) {
          // Only handle .js files
          if (!/\.(js|jsx)$/.test(interpolatedName)) {
            return { content, sourceMap };
          }

          const transformOptions = {
            babelrc: false,
            sourceMaps: dev ? 'both' : false,
            // Here we need to resolve all modules to the absolute paths.
            // Earlier we did it with the babel-preset.
            // But since we don't transpile ES2015 in the preset this is not resolving.
            // That's why we need to do it here.
            // See more: https://github.com/zeit/next.js/issues/951
            plugins: [
              require.resolve(
                join(__dirname, './babel/plugins/remove-dotjsx-from-import.js')
              ),
              [
                require.resolve(
                  'babel-plugin-transform-es2015-modules-commonjs'
                ),
              ],
              [
                require.resolve('babel-plugin-module-resolver'),
                {
                  alias: aliasModules,
                },
              ],
            ],
            inputSourceMap: sourceMap,
          };

          if (pluginNodeBabelAlias) {
            transformOptions.plugins.push(pluginNodeBabelAlias);
          }

          const transpiled = babelCore.transform(content, transformOptions);

          const { map } = transpiled;
          let output = transpiled.code;

          if (map) {
            const nodeMap = Object.assign({}, map);
            nodeMap.sources = nodeMap.sources.map(source =>
              source.replace(/\?entry/, '')
            );
            delete nodeMap.sourcesContent;

            // Output explicit inline source map that source-map-support can pickup via requireHook mode.
            // Since these are not formal chunks, the devtool infrastructure in webpack does not output
            // a source map for these files.
            const sourceMapUrl = Buffer.from(
              JSON.stringify(nodeMap),
              'utf-8'
            ).toString('base64');
            output = `${output}\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${sourceMapUrl}`;
          }

          return {
            content: output,
            sourceMap: transpiled.map,
          };
        },
      },
    },
    {
      loader: require.resolve('babel-loader'),
      include: [ avetPagesDir ],
      exclude(str) {
        return /node_modules/.test(str) && str.indexOf(avetPagesDir) !== 0;
      },
      options: {
        babelrc: false,
        cacheDirectory: true,
        presets: [ require.resolve('./babel/preset') ],
      },
    },
    {
      test: /\.(js|jsx)(\?[^?]*)?$/,
      loader: require.resolve('babel-loader'),
      // include: [ baseDir ],
      exclude(str) {
        return (
          /core-js/.test(str) ||
          /babel/.test(str) ||
          /regenerator-runtime/.test(str) ||
          /axios/.test(str)
        );
      },
      options: mainBabelOptions,
    },
  ];

  let webpackConfig = {
    context: dir,
    entry,
    output: {
      path: join(dir, buildConfig.distDir),
      filename: '[name]',
      libraryTarget: 'commonjs2',
      publicPath: '/_app/webpack/',
      strictModuleExceptionHandling: true,
      devtoolModuleFilenameTemplate({ resourcePath }) {
        const hash = createHash('sha1');
        hash.update(`${String(Date.now())}`);
        const id = hash.digest('hex').slice(0, 7);

        // append hash id for cache busting
        return `webpack:///${resourcePath}?${id}`;
      },
      // This saves chunks with the name given via require.ensure()
      chunkFilename: '[name]-[chunkhash].js',
    },
    resolve: {
      alias: {
        // This bypasses React's check for production mode. Since we know it is in production this way.
        // This allows us to exclude React from being uglified. Saving multiple seconds per build.
        'react-dom': dev
          ? 'react-dom/cjs/react-dom.development.js'
          : 'react-dom/cjs/react-dom.production.min.js',
      },
      extensions: [ '.js', '.jsx', '.json' ],
      modules: [ avetNodeModulesDir, 'node_modules', ...nodePathList ],
    },
    resolveLoader: {
      modules: [
        avetNodeModulesDir,
        'node_modules',
        join(__dirname, 'loaders'),
        ...nodePathList,
      ],
    },
    plugins: webpackPlugins,
    module: {
      rules: [ ...devLoaders, ...loaders ],
    },
    devtool: dev ? 'cheap-module-inline-source-map' : false,
    performance: { hints: false },
  };

  if (buildConfig.webpack || buildConfig._webpackFnList) {
    webpackConfig = await getAppWebpackConfig(
      buildConfig.webpack,
      buildConfig._webpackFnList,
      webpackConfig,
      appConfig,
      webpack
    );
  }

  return webpack(webpackConfig);
};

async function getAppWebpackConfig(
  webpackConfig = {},
  webpackFnList,
  initConfig,
  webpack,
  appConfig
) {
  let ret = extend(true, initConfig, webpackConfig);
  if (Array.isArray(webpackFnList)) {
    for (const fn of webpackFnList) {
      ret = await fn(ret, appConfig, webpack);
    }
  }

  return ret;
}
