import * as fs from 'fs';
import { resolve, join, sep } from 'path';
import { createHash } from 'crypto';
import webpack from 'webpack';
import glob from 'glob-promise';
import WriteFilePlugin from 'write-file-webpack-plugin';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import CaseSensitivePathPlugin from 'case-sensitive-paths-webpack-plugin';
import UnlinkFilePlugin from './plugins/unlink-file-plugin';
import PagesPlugin from './plugins/pages-plugin';
import DynamicChunksPlugin from './plugins/dynamic-chunks-plugin';
import CombineAssetsPlugin from './plugins/combine-assets-plugin';
import * as babelCore from 'babel-core';
import findBabelConfig from './babel/find-config';
import rootModuleRelativePath from './root-module-relative-path';
import extend from 'extend2';
import moduleAliasPath from './module-alias-path';

const documentPage = join('page', '_document.js');
const defaultPages = ['_error.js', '_document.js'];
const avetPagesDir = join(__dirname, '..', 'page');
const avetNodeModulesDir = join(__dirname, '..', '..', 'node_modules');
const interpolateNames = new Map(
  defaultPages.map(p => {
    return [join(avetPagesDir, p), `dist/page/${p}`];
  })
);

const relativeResolve = rootModuleRelativePath(require);

export default async function createCompiler(
  dir,
  { dev = false, quiet = false, buildDir, buildExtends = {}, config = {}, appConfig = {} } = {}
) {

  dir = resolve(dir);
  const defaultEntries = dev
    ? [
      join(__dirname, '..', 'client', 'webpack-hot-middleware-client'),
      join(__dirname, '..', 'client', 'on-demand-entries-client'),
    ]
    : [];
  const mainJS = dev
    ? require.resolve('../client/avet-dev')
    : require.resolve('../client/avet');

  let totalPages;

  const entry = async () => {
    const entries = {
      'main.js': [...defaultEntries, mainJS],
    };

    const pages = await glob('page/**/*.js', { cwd: dir });
    const devPages = pages.filter(
      p => p === 'page/_document.js' || p === 'page/_error.js'
    );

    // In the dev environment, on-demand-entry-handler will take care of
    // managing pages.
    if (dev) {
      for (const p of devPages) {
        entries[join('bundles', p)] = [`./${p}?entry`];
      }
    } else {
      for (const p of pages) {
        entries[join('bundles', p)] = [`./${p}?entry`];
      }
    }

    for (const p of defaultPages) {
      const entryName = join('bundles', 'page', p);
      if (!entries[entryName]) {
        entries[entryName] = [join(avetPagesDir, p) + '?entry'];
      }
    }

    totalPages = pages.filter(p => p !== documentPage).length;

    return entries;
  };

  const plugins = [
    new webpack.IgnorePlugin(/(precomputed)/, /node_modules.+(elliptic)/),
    new webpack.LoaderOptionsPlugin({
      options: {
        context: dir,
        customInterpolateName(url, name, opts) {
          return interpolateNames.get(this.resourcePath) || url;
        },
        resolve: {
          extensions: ['.ts', '.tsx', '.js']
        }
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
        // In the dev we use on-demand-entries.
        // So, it makes no sense to use commonChunks based on the minChunks count.
        // Instead, we move all the code in node_modules into each of the pages.
        if (dev) {
          return false;
        }

        // Move react-dom into commons.js always
        if (
          module.context &&
          module.context.indexOf(`${sep}react-dom${sep}`) >= 0
        ) {
          return true;
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
      'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production'),
    }),
    new PagesPlugin(),
    new DynamicChunksPlugin(),
    new CaseSensitivePathPlugin(),
  ];

  if (dev) {
    plugins.push(
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new UnlinkFilePlugin()
    );
    if (!quiet) {
      // plugins.push(new FriendlyErrorsWebpackPlugin());
    }
  } else {
    plugins.push(new webpack.IgnorePlugin(/react-hot-loader/));
    plugins.push(
      new CombineAssetsPlugin({
        input: ['manifest.js', 'commons.js', 'main.js'],
        output: 'app.js',
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: { warnings: false },
        sourceMap: false,
      })
    );
    plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
  }

  const nodePathList = (process.env.NODE_PATH || '')
    .split(process.platform === 'win32' ? ';' : ':')
    .filter(p => !!p);

  // 不会使用 babelrc 配置
  let mainBabelOptions = {
    babelrc: false,
    cacheDirectory: true,
    presets: [],
    plugins: []
  };

  // 看插件是否提供 babel 配置
  if (config.babel) {
    mainBabelOptions = extend(true, mainBabelOptions, config.babel);
  }

  const babelPreset = require('./babel/preset')({ dir, config, buildExtends });
  mainBabelOptions.presets = mainBabelOptions.presets.concat(babelPreset.presets);
  mainBabelOptions.plugins = mainBabelOptions.plugins.concat(babelPreset.plugins);

  const rules = (dev
    ? [
      {
        test: /\.js(\?[^?]*)?$/,
        loader: 'hot-self-accept-loader',
        include: [join(dir, 'page'), avetPagesDir],
      },
      {
        test: /\.js(\?[^?]*)?$/,
        loader: 'react-hot-loader/webpack',
        exclude: /node_modules/,
      },
    ]
    : []).concat([
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.(js|json)(\?[^?]*)?$/,
        loader: 'emit-file-loader',
        include: [dir, avetPagesDir],
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

            const transpiled = babelCore.transform(content, {
              babelrc: false,
              sourceMaps: dev ? 'both' : false,
              presets: babelPreset.presets,
              plugins: babelPreset.plugins,
              inputSourceMap: sourceMap,
            });

            return {
              content: transpiled.code,
              sourceMap: transpiled.map,
            };
          },
        },
      },
      {
        loader: 'babel-loader',
        include: [avetPagesDir],
        exclude(str) {
          return /node_modules/.test(str) && str.indexOf(avetPagesDir) !== 0;
        },
        options: {
          babelrc: false,
          cacheDirectory: true,
          presets: babelPreset.presets,
          plugins: babelPreset.plugins,
        },
      },
      {
        test: /\.js(\?[^?]*)?$/,
        loader: 'babel-loader',
        include: [dir],
        exclude(str) {
          return /node_modules/.test(str);
        },
        options: mainBabelOptions
      },
    ]);

  let webpackConfig = {
    context: dir,
    entry,
    output: {
      path: buildDir ? join(buildDir, '.avet') : join(dir, config.distDir),
      filename: '[name]',
      libraryTarget: 'commonjs2',
      publicPath: '/_avet/webpack/',
      strictModuleExceptionHandling: true,
      devtoolModuleFilenameTemplate({ resourcePath }) {
        const hash = createHash('sha1');
        hash.update(Date.now() + '');
        const id = hash.digest('hex').slice(0, 7);

        // append hash id for cache busting
        return `webpack:///${resourcePath}?${id}`;
      },
      // This saves chunks with the name given via require.ensure()
      chunkFilename: '[name]',
    },
    resolve: {
      modules: [avetNodeModulesDir, 'node_modules', ...nodePathList],
    },
    resolveLoader: {
      modules: [
        avetNodeModulesDir,
        'node_modules',
        join(__dirname, 'loaders'),
        ...nodePathList,
      ],
    },
    plugins,
    module: {
      rules,
    },
    devtool: dev ? 'cheap-module-inline-source-map' : false,
    performance: { hints: false },
  };

  if (config.webpack || config._webpackFnList) {
    webpackConfig = await getAppWebpackConfig(
      config.webpack,
      config._webpackFnList,
      webpackConfig,
      webpack,
      appConfig
    );
  }

  return webpack(webpackConfig);
}

async function getAppWebpackConfig(webpackConfig = {}, webpackFnList, initConfig, webpack, appConfig) {
  let ret = extend(true, initConfig, webpackConfig);
  if (Array.isArray(webpackFnList)) {
    for (const fn of webpackFnList) {
      await new Promise((resolve, reject) => {
        ret = fn(ret, webpack, appConfig);
        resolve();
      });
    }
  }

  return ret;
}
