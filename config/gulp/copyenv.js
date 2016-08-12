var gulp = require('gulp');
var rename = require('gulp-rename');
var replace = require('gulp-replace');

var NODE_ENV = process.env.NODE_ENV;

gulp.task('copyenv', function() {
  return gulp.src('config/environment/' + (NODE_ENV || 'development') + '.env.coffee')
  .pipe(rename('env.coffee'))
  .pipe(replace(/COPYENV_REPLACE_WITH_DOUBTFIRE_DOCKER_MACHINE_IP/, process.env.DOUBTFIRE_DOCKER_MACHINE_IP))
  .pipe(gulp.dest('src/app/api'));
});
