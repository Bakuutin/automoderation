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

var config = {
    production: !!gutil.env.production
};

function swallowError (error) {
    console.log(error.toString())
    this.emit('end')
}

gulp.task('scripts', function () {
    var bundler = browserify('./src/index.jsx')
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
        .pipe(config.production ? gutil.noop(): sourcemaps.init({'loadmaps': true}))
        .pipe(config.production ? uglify() : gutil.noop())
        .pipe(concat('bundle.js'))
        .pipe(config.production ? gutil.noop(): sourcemaps.write('.'))
        .on('error', swallowError)
        .pipe(gulp.dest('/data/static/js'));
});


gulp.task('watchScripts', ['build'], function() {
    gulp.watch(['src/*.js', 'src/index.jsx', 'src/components/*.jsx'], ['scripts'])
});

gulp.task('awesome', function() {
    gulp.src('node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest('/data/static/fonts/font-awesome'))
})

gulp.task('roboto', function() {
    gulp.src(
        'node_modules/roboto-fontface/fonts/roboto/*')
        .pipe(gulp.dest('/data/static/fonts/roboto'))
})

gulp.task('fonts', ['awesome', 'roboto'])

gulp.task('styles', function() {
    gulp.src('src/style.scss')
        .pipe(sass({includePaths: ['node_modules']}).on('error', sass.logError))
        .pipe(concat('style.css'))
        .on('error', swallowError)
        .pipe(gulp.dest('/data/static/css'));
});

gulp.task('watchStyles', ['build'], function() {
    gulp.watch('src/style.scss', ['styles'])
});

gulp.task('public', function() {
    gulp.src('public/*').pipe(gulp.dest('/data/static'))
    gulp.src('public/icons/*').pipe(gulp.dest('/data/static/icons'))
})

gulp.task('build', ['public', 'scripts', 'fonts', 'styles']);

gulp.task('watch', ['build', 'watchScripts', 'watchStyles']);
