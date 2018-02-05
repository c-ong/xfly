var gulp        = require('gulp');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');
// var gulp_copy   = require('gulp-copy');


gulp.task('compress', function() {
    gulp.src(
        [
            'xfly.js'
        ] )
        .pipe( uglify() )
        .pipe( rename( 'xfly.min.js' ) )
        .pipe( gulp.dest( '' ) );
} );

gulp.task( 'copy', function () {
        gulp.src(['xfly.min.js'])
        .pipe( gulp_copy( 'examples/js' ) )
} );





gulp.task('default', function() {
    // place code for your default task here
    gulp.run( 'compress' );
    // gulp.run( 'copy' );
});