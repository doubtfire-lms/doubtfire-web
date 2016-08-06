// Karma configuration
'use strict';

// START_CONFIT_GENERATED_CONTENT
var commonConfig = require('./common.karma.conf.js');
var debugMode = process.argv.indexOf('--debug') > -1;
var noCoverage = process.argv.indexOf('--no-coverage') > -1;

function getConfitConfig(config) {
  // level of logging
  // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
  commonConfig.logLevel = config.LOG_INFO;

  // QUIRK: karma-webpack
  // Remove the CommonsChunk plugin, as it interferes with testing (and doesn't affect code execution)
  // https://github.com/webpack/karma-webpack/issues/24
  commonConfig.webpack.plugins = commonConfig.webpack.plugins.filter(function(plugin) {
    return !(plugin.ident && plugin.ident.indexOf('CommonsChunkPlugin'));
  });


  if (debugMode) {
    // Remove the coverage reporter, otherwise it runs against the instrumented code, making it difficult to debug the code.
    commonConfig.webpack.module.preLoaders = commonConfig.webpack.module.preLoaders.filter(function(loader) {
      return loader.loader.indexOf('isparta-instrumenter-loader') === -1;
    });

    // No point checking threshold if we removing the the coverage tool
    commonConfig.reporters = commonConfig.reporters.filter(function(reporter) {
      return reporter !== 'threshold' || reporter !== 'coverage';
    });
  }

  if (noCoverage) {
    commonConfig.reporters = commonConfig.reporters.filter(function(reporter) {
      return reporter !== 'threshold';
    });
  }

  config.set(commonConfig);
};
// END_CONFIT_GENERATED_CONTENT

module.exports = getConfitConfig;
