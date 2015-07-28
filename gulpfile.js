var gulp = require('gulp');
var Server = require('karma').Server;

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

gulp.task('default', ['test']);