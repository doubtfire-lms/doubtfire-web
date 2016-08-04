module.exports = function (grunt) {
  'use strict';

  // We make this configuration lively so that we can change it at runtime (for testing purposes)
  var path = require('path');
  var toolingConfig = require(path.join(process.cwd(), 'config/tooling.config.json'));

  grunt.extendConfig({
    connect: {
      prod: {
        options: {
          open: grunt.option('url') ? toolingConfig.serverProd.protocol + '://' + toolingConfig.serverProd.hostname + ':' + toolingConfig.serverProd.port + '/' + grunt.option('url') : false,
          base: toolingConfig.paths.output.prodDir,
          port: grunt.option('port') || toolingConfig.serverProd.port,
          hostname: toolingConfig.serverProd.hostname,
          protocol: toolingConfig.serverProd.protocol,
          keepalive: true
        }
      }
    }
  });
};
