'use strict';
module.exports = function(grunt) {

  var path = require('path');

  // Time how long tasks take. Can help when optimizing build times
  require('load-grunt-tasks')(grunt);

  // Load additional tasks
  grunt.loadTasks(path.join('config/grunt'));

};
