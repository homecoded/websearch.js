var gulp = require('gulp'),
    Server = require('karma').Server,
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat-util'),
    fs = require('fs'),
    clean = require('gulp-clean'),
    rename = require('gulp-rename')
;

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/tests/karma.conf.js',
        singleRun: true
    }, done).start();
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/tests/karma.conf.js'
    }, done).start();
});

/**
 * JSLint task
 */
gulp.task('lint', function() {
    return gulp.src(['./js/*.js', './tests/suites/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

/**
 * compress js
 */
gulp.task('compress', ['clean'], function() {
    return gulp.src('js/*.js')
        .pipe(uglify())
        .pipe(rename(function (path) {
            path.basename += ".min";
        }))
        .pipe(gulp.dest('dist'));
});


/**
 * Prepend license text to the js files
 */
gulp.task('license', ['compress'], function () {
    var license = fs.readFileSync('LICENSE_SHORT');

    return gulp.src('dist/*.js')
        .pipe(concat.header(license))
        .pipe(gulp.dest('dist'));
});

/**
 * Clean up destination folder
 */
gulp.task('clean', function () {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

gulp.task('build', ['compress', 'license']);

gulp.task('default', ['test', 'build']);