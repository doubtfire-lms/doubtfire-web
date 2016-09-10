'use strict';

// START_CONFIT_GENERATED_CONTENT
var _ = require('lodash');
var config = require('./common.webpack.conf.js');
var webpack = require('webpack');

_.merge(config, {
  debug: true,
  devtool: 'source-map'
});

// Adding this makes source-maps work in safari
config.plugins.push(new webpack.optimize.UglifyJsPlugin({
  compress: false,
  mangle: false
}));

// Merging of arrays is tricky - just push the item onto the existing array
config.plugins.push(new webpack.DefinePlugin({
  __DEV__: true,
  __PROD__: false
}));
// END_CONFIT_GENERATED_CONTENT

module.exports = config;
