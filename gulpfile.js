var gulp = require('gulp');
var concat = require('gulp-concat');
var umd = require('gulp-umd');
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');


gulp.task('build', function () {
    return gulp.src(['./source/htmlparser.js', './source/converter.js'])
        .pipe(concat('itemplate.js'))
        .pipe(umd({
            namespace: function (file) {
                return 'itemplate';
            },
            exports: function(file) {
                return 'itemplate';
            }
        }))
        .pipe(gulp.dest('./bin/'));
});

gulp.task('uglify', function () {
    return gulp.src('./bin/itemplate.js')
        .pipe(concat('itemplate.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./bin/'));
});

gulp.task('default', runSequence('build', 'uglify'));