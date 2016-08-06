module.exports = function (grunt) {
  'use strict';

  var path = require('path');
  var pathJoin = function(item) { return path.join(item); };

  grunt.extendConfig({
    eslint: {
      options: {
        configFile: path.join('config/verify/.eslintrc'),
        quiet: true // Report errors only
      },
      all: {
        src: [
            'src/**/*.js',
            'config/**/*.js'
          ].map(pathJoin)
      }
    },
    sasslint: {
      options: {
        configFile: path.join('config/verify/.sasslintrc')
      },
      all: [
            'src/**/*.sass',
            'src/**/*.scss'
          ].map(pathJoin)
    },
    coffeelint: {
      options: {
        configFile: 'config/verify/coffeelint.json'
      },
      all: [
          'src/**/*.coffee'
        ].map(pathJoin)
    },
    watch: {
      verify: {
        options: {
          spawn: true
        },
        files: [
            'src/**/*.js',
            'config/**/*.js',
            'src/**/*.sass',
            'src/**/*.scss'
          ].map(pathJoin),
        tasks: [
            // 'newer:eslint:all',
            // 'newer:coffeelint:all',
            // 'newer:sasslint:all'
          ]
      }
    }
  });

  grunt.registerTask('verify', 'Run all the verify tasks', [
      // TODO: enable. we should lint js mainly for the config/
      // 'eslint:all',
      // 'sasslint:all',
      // 'coffeelint:all'
    ]);
};
