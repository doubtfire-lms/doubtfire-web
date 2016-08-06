'use strict';

/** Build START */
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');
var helpers = require('./webpackHelpers');
var basePath = process.cwd() + path.sep;

// https://webpack.github.io/docs/configuration.html#resolve-extensions
var jsExtensions = [
  '',
  '.webpack.js',
  '.web.js',
  '.js',
  '.coffee'
];
var moduleDirectories = ['node_modules', 'bower_components'];

var config = {
  /**
   * Devtool
   * Reference: http://webpack.github.io/docs/configuration.html#devtool
   * Type of sourcemap to use per build type
   */
  devtool: 'source-map',
  context: path.join(basePath, 'src'),  // The baseDir for resolving the entry option and the HTML-Webpack-Plugin
  output: {
    filename: 'js/[name].[hash:8].js',
    chunkFilename: 'js/[id].[chunkhash:8].js',  // The name for non-entry chunks
    path: 'dist/',
    pathinfo: false   // Add path info beside module numbers in source code. Do not set to 'true' in production. http://webpack.github.io/docs/configuration.html#output-pathinfo
  },
  module: {
    loaders: []
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(true)
  ],

  resolve: {
    // https://webpack.github.io/docs/configuration.html#resolve-modulesdirectories
    modulesDirectories: moduleDirectories,
    extensions: jsExtensions,
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']
  },

  // Output stats to provide more feedback when things go wrong:
  stats: {
    colors: true,
    modules: true,
    reasons: true
  }
};
/* **/

/** Entry point START **/
config.entry = {
  'doubtfireWeb': [
    './app/app.coffee'
  ]
};

// (Re)create the config.entry.vendor entryPoint
config.entry.vendor = [
  'angular'
];

// Create a common chunk for the vendor modules (https://webpack.github.io/docs/list-of-plugins.html#2-explicit-vendor-chunk)
var commonsChunkPlugin = new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  filename: 'vendor/[name].[hash:8].js',
  minChunks: Infinity
});

config.plugins.push(commonsChunkPlugin);

/** Entry point END **/

/** JS START */

var srcLoader = {
  test: helpers.pathRegEx(/src\/.*\.(coffee)$/),
  loader: 'coffee-loader',
  exclude: ['node_modules'],    // There should be no need to exclude unit or browser tests because they should NOT be part of the source code dependency tree
};

config.module.loaders.push(srcLoader);
/* **/

/** TEST UNIT START */
/* **/

/** Assets START **/

var fontLoader = {
  $$name: 'fontLoader',
  test: helpers.pathRegEx(/src.*\/assets\/fonts\/.*\.(eot|otf|svg|ttf|woff|woff2)(\?.*)?$/),
  loader: 'file-loader?name=/assets/fonts/[1].[hash:8].[ext]&regExp=' + helpers.pathRegEx('/src.*/assets/fonts/(.*)([^.]*$|$)')
};

config.module.loaders.push(fontLoader);

var vendorFontLoader = {
  $$name: 'vendorFontLoader',
  test: helpers.pathRegEx(/node_modules\/.*\.(eot|otf|svg|ttf|woff|woff2)(\?.*)?$/),
  loader: 'file-loader?name=/assets/fonts/[1]/[2].[hash:8].[ext]&regExp=' + helpers.pathRegEx('/node_modules/([^/]*).*/([^/]*)([^.]*$|$)')
};

config.module.loaders.push(vendorFontLoader);
var imageLoader = {
  $$name: 'imageLoader',
  test: helpers.pathRegEx(/src.*\/assets\/images\/.*\.(gif|ico|jpg|png|svg)(\?.*)?$/),
  loader: 'file-loader?name=/assets/images/[1].[hash:8].[ext]&regExp=' + helpers.pathRegEx('/src.*/assets/images/(.*)([^.]*$|$)')
};

config.module.loaders.push(imageLoader);

// Favicons
var FaviconsWebpackPlugin = require('favicons-webpack-plugin');
var faviconsHtmlPlugin = new FaviconsWebpackPlugin({
  logo: path.join(basePath + 'src/assets/images/logo.png'),
  prefix: 'assets/images/icons/[hash]-',
  emitStats: false,
  statsFilename: 'assets/images/icons/[hash].json',
  // Generate a cache file with control hashes and
  // don't rebuild the favicons until those hashes change
  persistentCache: true,
  // Inject the html into the html-webpack-plugin
  inject: true,
  // favicon background color (see https://github.com/haydenbleasel/favicons#usage)
  background: '#fff',
  // favicon app title (see https://github.com/haydenbleasel/favicons#usage)
  title: 'Doubtfire'
});

config.plugins.push(faviconsHtmlPlugin);

/* **/

/** CSS START **/
var autoprefixer = require('autoprefixer');

config.postcss = [
  autoprefixer({
    browsers: [
      'last 1 version'
    ]
  })
];

var cssLoader = {
  test: helpers.pathRegEx(/\.(sass|scss)$/),
  loader: ExtractTextPlugin.extract('style-loader', 'css-loader!postcss-loader!sass-loader?indentedSyntax=true')
};

config.module.loaders.push(cssLoader);

// For any entry-point CSS file definitions, extract them as text files as well
var extractCSSTextPlugin = new ExtractTextPlugin('css/[name].[contenthash:8].css', {allChunks: true});

config.plugins.push(extractCSSTextPlugin);
/* **/

/** HTML START */
var HtmlWebpackPlugin = require('html-webpack-plugin');
var htmlLoader = {
  test: /\.html$/,
  loader: 'html-loader',
  exclude: /index-template.html$/
};

config.module.loaders.push(htmlLoader);

// Configuration that works with Angular 2  :(
config.htmlLoader = {
  minimize: true,
  removeAttributeQuotes: false,
  caseSensitive: true,
  customAttrSurround: [ [/#/, /(?:)/], [/\*/, /(?:)/], [/\[?\(?/, /(?:)/] ],
  customAttrAssign: [ /\)?\]?=/ ]
};


var indexHtmlPlugin = new HtmlWebpackPlugin({
  filename: 'index.html',
  inject: false,      // We want full control over where we inject the CSS and JS files
  template: path.join(basePath + 'src/index-template.html')
});

config.plugins.push(indexHtmlPlugin);
/* **/

/** Server - DEV - START */
var yaml = require('js-yaml');
var fs = require('fs');
var toolingConfig = yaml.load(fs.readFileSync(path.join(process.cwd(), 'config/tooling.config.yml')));

config.devServer = {
  contentBase: config.output.path,  // We want to re-use this path
  noInfo: false,
  debug: true, // Makes no difference
  port: toolingConfig.serverDev.port,
  https: toolingConfig.serverDev.protocol === 'https',
  colors: true,
  // hot: true,    // Pass this from the command line as '--hot', which sets up the HotModuleReplacementPlugin automatically
  inline: true,
  // CORS settings:
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'accept, content-type, authorization',
    'Access-Control-Allow-Credentials': true
  }
};
/* **/


// To remove content hashes, call helpers.removeHash(config.prop.parent, propertyName, regExMatcher (optional));
// For example helpers.removeHash(config.output, 'fileName', /\[(contentHash|hash).*?\]/)

module.exports = config;
