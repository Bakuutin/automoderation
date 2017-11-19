// var browserify = require('browserify');
var gulp = require('gulp');
// var source = require('vinyl-source-stream');
// var buffer = require('vinyl-buffer');
var gutil       = require('gulp-util');
var uglify      = require('gulp-uglify');
var sourcemaps  = require('gulp-sourcemaps');
var babel       = require('gulp-babel');
var concat      = require('gulp-concat');
var sass        = require('gulp-sass');

gulp.task('scripts', function () {
    gulp.src('./src/index.jsx')
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: [
                'stage-1',
                'es2015',
                'react'
                ]
            }))
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
        .pipe(sass({includePaths: ['node_modules']}).on('error', sass.logError))
        .pipe(gulp.dest('public/css'));
});

gulp.task('watchStyles', ['build'], function() {
    gulp.watch('src/style.scss', ['styles'])
});

gulp.task('build', ['scripts', 'fonts', 'styles']);

gulp.task('watch', ['build', 'watchScripts', 'watchStyles']);
