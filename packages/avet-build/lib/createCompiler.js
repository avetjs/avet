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
const generateExtend = require('./generate-extend');
const {
  getPluginNodeBabelAlias,
  getPluginModuleBabelAlias,
} = require('./utils');

const relativeResolve = require('./root-module-relative-path')(require);

module.exports = async function createCompiler(
  rootDir,
  {
    baseDir,
    dev = false,
    buildConfig = {},
    appConfig = {},
    extendConfig = {},
    plugins = {},
  } = {}
) {
  rootDir = rootDir.replace(/\/$/i, '');

  await generateExtend(appConfig, extendConfig);

  const pluginNodeBabelAlias = getPluginNodeBabelAlias(plugins);
  const pluginModuleBabelAlias = getPluginModuleBabelAlias(plugins);

  const documentPage = join('page', '_document.js');
  const defaultPages = [ '_error.js', '_document.js' ];
  const avetPagesDir = join(__dirname, 'page');
  const avetNodeModulesDir = join(rootDir, 'node_modules');
  const interpolateNames = new Map(
    defaultPages.map(p => {
      return [ join(avetPagesDir, p), `dist/page/${p}` ];
    })
  );

  const defaultEntries = dev
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
    const entries = {
      'main.js': [ ...defaultEntries, mainJS ],
    };

    const pages = await glob('page/**/*.js', { cwd: rootDir });
    const devPages = pages.filter(
      p => p === 'page/_document.js' || p === 'page/_error.js'
    );

    // In the dev environment, on-demand-entry-handler will take care of
    // managing pages.
    if (dev) {
      for (const p of devPages) {
        entries[join('bundles', p)] = [ `./${p}?entry` ];
      }
    } else {
      for (const p of pages) {
        entries[join('bundles', p)] = [ `./${p}?entry` ];
      }
    }

    for (const p of defaultPages) {
      const entryName = join('bundles', 'page', p);
      if (!entries[entryName]) {
        entries[entryName] = [ `${join(avetPagesDir, p)}?entry` ];
      }
    }

    totalPages = pages.filter(p => p !== documentPage).length;

    return entries;
  };

  const webpackPlugins = [
    new webpack.IgnorePlugin(/(precomputed)/, /node_modules.+(elliptic)/),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: rootDir,
        customInterpolateName(url) {
          return interpolateNames.get(this.resourcePath) || url;
        },
        resolve: {
          extensions: [ '.ts', '.tsx', '.js' ],
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
        // Move react-dom into commons.js always
        if (
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
    // This chunk contains all the webpack related code. So, all the changes
    // related to that happens to this chunk.
    // It won't touch commons.js and that gives us much better re-build perf.
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      filename: 'manifest.js',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        dev ? 'development' : 'production'
      ),
    }),
    new PagesPlugin(),
    new DynamicChunksPlugin(),
    new CaseSensitivePathPlugin(),
  ];

  if (dev) {
    webpackPlugins.push(
      new webpack.NoEmitOnErrorsPlugin(),
      new UnlinkFilePlugin()
    );

    if (buildConfig.hotReload) {
      webpackPlugins.push(new webpack.HotModuleReplacementPlugin());
    }

    // if (!appConfig.avet.quiet) {
    //   webpackPlugins.push(new FriendlyErrorsWebpackPlugin());
    // }
  } else {
    webpackPlugins.push(new webpack.IgnorePlugin(/react-hot-loader/));
    webpackPlugins.push(
      new CombineAssetsPlugin({
        input: [ 'manifest.js', 'commons.js', 'main.js' ],
        output: 'app.js',
      }),
      new UglifyJSPlugin({
        parallel: true,
        sourceMap: false,
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

  const rules = (dev
    ? [
      {
        test: /\.js(\?[^?]*)?$/,
        loader: 'hot-self-accept-loader',
        include: [ join(rootDir, 'page'), avetPagesDir ],
      },
      {
        test: /\.js(\?[^?]*)?$/,
        loader: require.resolve('react-hot-loader/webpack'),
        exclude: /node_modules/,
      },
    ]
    : []
  ).concat([
    {
      test: /\.json$/,
      loader: require.resolve('json-loader'),
    },
    {
      test: /\.(js|json)(\?[^?]*)?$/,
      loader: 'emit-file-loader',
      include: [ rootDir, avetPagesDir ],
      exclude(str) {
        return /node_modules/.test(str) && str.indexOf(avetPagesDir) !== 0;
      },
      options: {
        name: 'dist/[path][name].[ext]',
        // By default, our babel config does not transpile ES2015 module syntax because
        // webpack knows how to handle them. (That's how it can do tree-shaking)
        // But Node.js doesn't know how to handle them. So, we have to transpile them here.
        transform({ content, sourceMap, interpolatedName }) {
          // Only handle .js files
          if (!/\.js$/.test(interpolatedName)) {
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
              [
                require.resolve(
                  'babel-plugin-transform-es2015-modules-commonjs'
                ),
              ],
              [
                require.resolve('babel-plugin-module-resolver'),
                {
                  alias: {
                    'babel-runtime': relativeResolve('babel-runtime/package'),
                    'avet/link': relativeResolve('avet-shared/lib/link'),
                    'avet/prefetch': relativeResolve(
                      'avet-shared/lib/prefetch'
                    ),
                    'avet/dynamic': relativeResolve('avet-shared/lib/dynamic'),
                    'avet/head': relativeResolve('avet-shared/lib/head'),
                    'avet/router': relativeResolve('avet-shared/lib/router'),
                    'avet/error': relativeResolve('avet-shared/lib/error'),
                    'avet/document': relativeResolve('../.external/document'),
                    'avet/config': relativeResolve('../.external/config'),
                  },
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
      include: [ baseDir ],
      exclude(str) {
        return (
          /core-js/.test(str) ||
          /babel/.test(str) ||
          /regenerator-runtime/.test(str)
        );
      },
      options: mainBabelOptions,
    },
  ]);

  let webpackConfig = {
    context: rootDir,
    entry,
    output: {
      path: join(rootDir, buildConfig.distDir),
      filename: '[name]',
      libraryTarget: 'commonjs2',
      publicPath: '/_avet/webpack/',
      strictModuleExceptionHandling: true,
      devtoolModuleFilenameTemplate({ resourcePath }) {
        const hash = createHash('sha1');
        hash.update(`${String(Date.now())}`);
        const id = hash.digest('hex').slice(0, 7);

        // append hash id for cache busting
        return `webpack:///${resourcePath}?${id}`;
      },
      // This saves chunks with the name given via require.ensure()
      chunkFilename: '[name]',
    },
    resolve: {
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
      rules,
    },
    devtool: dev ? 'cheap-module-inline-source-map' : false,
    performance: { hints: false },
  };

  if (buildConfig.webpack || buildConfig._webpackFnList) {
    webpackConfig = await getAppWebpackConfig(
      buildConfig.webpack,
      buildConfig._webpackFnList,
      webpackConfig,
      webpack,
      appConfig
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
      ret = await fn(ret, webpack, appConfig);
    }
  }

  return ret;
}
