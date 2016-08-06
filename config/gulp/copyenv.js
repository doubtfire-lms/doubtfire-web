var gulp = require('gulp');
var rename = require('gulp-rename');

var NODE_ENV = process.env.NODE_ENV;

gulp.task('copyenv', function() {
  return gulp.src('config/environment/' + (NODE_ENV || 'development') + '.env.coffee')
  .pipe(rename('env.coffee'))
  .pipe(gulp.dest('src/app/api'));
});
