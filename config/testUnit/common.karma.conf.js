// Global karma config
'use strict';

// START_CONFIT_GENERATED_CONTENT
var DefinePlugin = require('webpack').DefinePlugin;   // Needed to pass the testFilesRegEx to test.files.js
var testFilesRegEx = /unitTest\/.*spec\.(coffee)$/;

// Customise the testFilesRegEx to filter which files to test, if desired.
// E.g.
// if (process.argv.indexOf('--spec') !== -1) {
//   testFilesRegEx = ...
// }
// END_CONFIT_GENERATED_CONTENT


// START_CONFIT_GENERATED_CONTENT
// We want to re-use the loaders from the dev.webpack.config
var webpackConfig = require('./../webpack/dev.webpack.conf.js');
var preprocessorList = ['coverage', 'webpack', 'sourcemap'];

var karmaConfig = {
  autoWatch: true,

  // base path, that will be used to resolve files and exclude
  basePath: '../../',

  // testing framework to use (jasmine/mocha/qunit/...)
  frameworks: ['jasmine'],

  // list of files / patterns to exclude
  exclude: [],

  // web server default port
  port: 8081,

  // Start these browsers, currently available:
  // - Chrome, ChromeCanary, Firefox, Opera, Safari (only Mac), PhantomJS, IE (only Windows)
  browsers: [
    'PhantomJS'
  ],

  plugins: [
    'karma-phantomjs-launcher',
    'karma-jasmine',
    'karma-junit-reporter',
    'karma-coverage',
    'karma-chrome-launcher',
    require('karma-webpack'),
    'karma-spec-reporter',
    'karma-sourcemap-loader'
  ],

  files: [
    'node_modules/phantomjs-polyfill/bind-polyfill.js',
    'config/testUnit/test.files.js'
  ],

  preprocessors: {
    'config/testUnit/test.files.js': preprocessorList
  },


  reporters: ['progress', 'junit', 'coverage'],

  coverageReporter: {
    dir: 'reports/coverage',
    reporters: [
      { type: 'cobertura', subdir: 'cobertura' },
      { type: 'lcovonly', subdir: 'lcov' },
      { type: 'html', subdir: 'html' },
      { type: 'json', subdir: 'json' },
      { type: 'text' }
    ]
  },

  junitReporter: {
    outputDir: 'reports/unit/'
  },



  webpack: {
    module: {
      preLoaders: [
        // instrument only testing sources
        {
          test: /src\/modules\/.*\.(js)$/,
          loader: 'isparta-instrumenter-loader',
          exclude: [
            /node_modules|unitTest\/|browserTest\//
          ],
          query: {
            'babel': {
              'presets': [
                'es2015'
              ]
            }
          }
        }
      ],
      loaders: webpackConfig.module.loaders
    },
    plugins: webpackConfig.plugins.concat([new DefinePlugin({
      __karmaTestSpec: testFilesRegEx
    })]),
    resolve: webpackConfig.resolve,
    devtool: 'inline-source-map'      // Changed to allow the sourcemap loader to work: https://github.com/webpack/karma-webpack
  },

  webpackServer: {
    noInfo: true
  },

  singleRun: false,
  colors: true
};
// END_CONFIT_GENERATED_CONTENT

module.exports = karmaConfig;
