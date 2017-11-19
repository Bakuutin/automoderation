var browserify  = require('browserify'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    uglify      = require('gulp-uglify'),
    sourcemaps  = require('gulp-sourcemaps'),
    babelify    = require('babelify'),
    concat      = require('gulp-concat'),
    sass        = require('gulp-sass'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer');

gulp.task('scripts', function () {
    var bundler = browserify('./src/index.jsx', {debug: true})
        .transform(babelify, {
        presets: [
            'stage-1',
            'es2015',
            'react',
        ],
        sourceMaps: true,
    });

    bundler.bundle()
        .pipe(source('./src/index.jsx'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(concat('bundle.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/js'));
});

gulp.task('watchScripts', ['build'], function() {
    gulp.watch(['src/*.js', 'src/index.jsx', 'src/components/*.jsx'], ['scripts'])
});

gulp.task('awesome', function() {
    gulp.src('node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest('public/fonts/font-awesome'))
})

gulp.task('roboto', function() {
    gulp.src(
        'node_modules/roboto-fontface/fonts/roboto/*')
        .pipe(gulp.dest('public/fonts/roboto'))
})

gulp.task('fonts', ['awesome', 'roboto'])

gulp.task('styles', function() {
    gulp.src('src/style.scss')
        .pipe(
            sass({includePaths: ['node_modules']})
            .on('error', sass.logError))
        .pipe(concat('style.css'))
        .pipe(gulp.dest('public/css'));
});

gulp.task('watchStyles', ['build'], function() {
    gulp.watch('src/style.scss', ['styles'])
});

gulp.task('build', ['scripts', 'fonts', 'styles']);

gulp.task('watch', ['build', 'watchScripts', 'watchStyles']);
