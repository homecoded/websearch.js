var gulp = require('gulp'),
    Server = require('karma').Server,
    jshint = require('gulp-jshint')
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

gulp.task('default', ['lint', 'test']);