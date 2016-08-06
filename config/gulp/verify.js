var gulp = require('gulp');
var coffeelint = require('gulp-coffeelint');

gulp.task('verify:coffee', function() {
  return gulp.src(['src/**/*.coffee', 'unitTest/**/*.coffee', 'config/**/*.coffee'])
    .pipe(coffeelint('./config/verify/coffeelint.json'))
    .pipe(coffeelint.reporter())
    .pipe(coffeelint.reporter('fail'));
});
