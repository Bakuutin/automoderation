var browserify  = require('browserify'),
    gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    uglify      = require('gulp-uglify'),
    sourcemaps  = require('gulp-sourcemaps'),
    babelify    = require('babelify'),
    concat      = require('gulp-concat'),
    sass        = require('gulp-sass'),
    source      = require('vinyl-source-stream'),
    buffer      = require('vinyl-buffer'),
    fs          = require('fs'),
    tap         = require('gulp-tap');

var config = {
    production: !!gutil.env.production,
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
};


function swallowError (error) {
    console.log(error.toString())
    this.emit('end')
}

gulp.task('scripts', ['createConfig'], function () {
    browserify({
        'entries': 'src/index.jsx',
        'debug': !config.production,
        'transform': [babelify.configure({
            presets: [
                'stage-1',
                'es2015',
                'react',
            ],
            sourceMaps: !config.production,
        })]
    })
    .bundle()
    .pipe(source('src/index.jsx'))
    .pipe(buffer())
    .pipe(config.production ? gutil.noop(): sourcemaps.init({loadMaps: true}))
    .pipe(config.production ? uglify() : gutil.noop())
    .pipe(concat('bundle.js'))
    .pipe(config.production ? gutil.noop(): sourcemaps.write('.', {
        includeContent: false,
        sourceRoot: '/static',
    }))
    .on('error', swallowError)
    .pipe(gulp.dest('/data/static/js'));

    if (!config.production) {
        gulp.src(['src/**/*'], {"base" : "src"}).pipe(gulp.dest('/data/static/src/src'));
    }
});

gulp.task('watchScripts', ['build'], function() {
    gulp.watch(['src/*.js', 'src/index.jsx', 'src/components/*.jsx'], ['scripts'])
});

gulp.task('awesome', function() {
    gulp.src('node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest('/data/static/fonts/font-awesome'))
})

gulp.task('createConfig', function() {
    console.log(config);
    fs.writeFile('/data/static/js/config.json', JSON.stringify(config));
});

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
