module.exports = function (grunt) {
  'use strict';

  var path = require('path');
  var fs = require('fs');
  var NODE_ENV = process.env.NODE_ENV;

  grunt.extendConfig({
    copy: {
      'environment-production': {
        src: 'config/environment/production.env.coffee',
        dest: 'src/app/api/env.coffee'
      },
      'environment-docker': {
        src: 'config/environment/docker.env.coffee',
        dest: 'src/app/api/env.coffee'
      },
      'environment-develop': {
        src: 'config/environment/development.env.coffee',
        dest: 'src/app/api/env.coffee'
      }
    }
  });

  grunt.registerTask('environment', 'copy the ', function () {
    if (NODE_ENV === 'production') {
      grunt.task.run('copy:environment-production');
    } else if (NODE_ENV === 'docker') {
      grunt.task.run('copy:environment-docker');
    } else {
      grunt.task.run('copy:environment-develop');
    }
  });
};
