var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');
var fs = require('fs');
var git = require('git-rev-sync');
var tryFn = require('nice-try');
var saveLicense = require('uglify-save-license');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('lint', function () {
    return gulp.src([
        'src/scripts/**/*.js'
    ]).pipe(reload({stream: true, once: true}))
        .pipe($.eslint.format())
        .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
        .pipe(gulp.dest('src/scripts'));
});

gulp.task('prepare-fonts', function () {
    return gulp.src([
        'node_modules/font-awesome/fonts/fontawesome-webfont.*'
    ]).pipe(gulp.dest('.tmp/fonts'));
});

gulp.task('process-fonts', ['prepare-fonts'], function () {
    return gulp.src([
        '.tmp/fonts/**/*'
    ]).pipe(gulp.dest('dist/fonts'));
});

gulp.task('prepare-langs', function () {
    return gulp.src([
        'src/langs/**/*'
    ]).pipe(gulp.dest('.tmp/langs'));
});

gulp.task('process-langs', ['prepare-langs'], function () {
    return gulp.src([
        '.tmp/langs/**/*'
    ]).pipe(gulp.dest('dist/langs'));
});

gulp.task('prepare-styles', function () {
    return gulp.src([
        'src/styles/**/*.css'
    ]).pipe($.autoprefixer())
        .pipe(gulp.dest('.tmp/styles'))
        .pipe(reload({stream: true}));
});

gulp.task('prepare-scripts', function () {
    return gulp.src([
        'src/scripts/**/*.js'
    ]).pipe($.plumber())
        .pipe($.injectVersion({replace: '${ARIANG_VERSION}'}))
        .pipe($.replace(/\${ARIANG_BUILD_COMMIT}/g, tryFn(git.short) || 'Local'))
        .pipe(gulp.dest('.tmp/scripts'))
        .pipe(reload({stream: true}));
});

gulp.task('prepare-views', function () {
    return gulp.src([
        'src/views/**/*.html'
    ]).pipe($.htmlmin({collapseWhitespace: true}))
        .pipe($.angularTemplatecache({module: 'ariaNg', filename: 'views/templates.js', root: 'views/'}))
        .pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('prepare-html', ['prepare-styles', 'prepare-scripts', 'prepare-views'], function () {
    return gulp.src([
        'src/*.html'
    ]).pipe($.useref({searchPath: ['.tmp', 'src', '.']}))
        .pipe($.if('js/*.js', $.replace(/\/\/# sourceMappingURL=.*/g, '')))
        .pipe($.if('css/*.css', $.replace(/\/\*# sourceMappingURL=.* \*\/$/g, '')))
        .pipe($.if(['js/moment-with-locales-*.min.js', 'js/plugins.min.js', 'js/aria-ng.min.js'], $.uglify({output: {comments: saveLicense}})))
        .pipe($.if(['css/plugins.min.css', 'css/aria-ng.min.css'], $.cssnano({safe: true, autoprefixer: false})))
        .pipe($.replace(/url\((\.\.\/fonts\/[a-zA-Z0-9\-]+\.woff2)(\?[a-zA-Z0-9\-_=.]+)?\)/g, function(match, fileName) {
            return 'url(' + fileName + ')'; // remove version of woff2 file (woff2 file should be cached via application cache)
        }))
        .pipe($.if(['js/plugins.min.js', 'js/aria-ng.min.js', 'css/plugins.min.css', 'css/aria-ng.min.css'], $.rev()))
        .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
        .pipe($.revReplace())
        .pipe(gulp.dest('.tmp'));
});

gulp.task('process-html', ['prepare-html'], function () {
    return gulp.src([
        '.tmp/*.html'
    ]).pipe($.replace(/<!-- AriaNg-Bundle:\w+ -->/, ''))
        .pipe(gulp.dest('dist'));
});

gulp.task('process-assets', ['process-html'], function () {
    return gulp.src([
        '.tmp/css/**/*',
        '.tmp/js/**/*'
    ],{ base: '.tmp' })
        .pipe(gulp.dest('dist'));
});

gulp.task('process-assets-bundle', ['prepare-fonts', 'prepare-langs', 'prepare-html'], function () {
    return gulp.src('.tmp/index.html')
        .pipe($.replace(/<link rel="stylesheet" href="(css\/[a-zA-Z0-9\-_.]+\.css)">/g, function(match, fileName) {
            var content = fs.readFileSync('.tmp/' + fileName, 'utf8');
            return '<style type="text/css">' + content + '</style>';
        }))
        .pipe($.replace(/<script src="(js\/[a-zA-Z0-9\-_.]+\.js)"><\/script>/g, function(match, fileName) {
            var content = fs.readFileSync('.tmp/' + fileName, 'utf8');
            return '<script type="application/javascript">' + content + '</script>';
        }))
        .pipe($.replace(/url\(\.\.\/(fonts\/[a-zA-Z0-9\-]+\.woff)(\?[a-zA-Z0-9\-_=.]+)?\)/g, function(match, fileName) {
            if (!fs.existsSync('.tmp/' + fileName)) {
                return match;
            }

            var contentBuffer = fs.readFileSync('.tmp/' + fileName);
            var contentBase64 = contentBuffer.toString('base64');
            return 'url(data:application/x-font-woff;base64,' + contentBase64 + ')';
        }))
        .pipe($.replace('<!-- AriaNg-Bundle:languages -->', function() {
            var langDir = '.tmp/langs/';
            var result = '';
            var fileNames = fs.readdirSync(langDir, 'utf8');

            if (fileNames.length > 0) {
                result = '<script type="application/javascript">' +
                    'angular.module("ariaNg").config(["ariaNgAssetsCacheServiceProvider",function(e){';

                for (var i = 0; i < fileNames.length; i++) {
                    var fileName = fileNames[i];
                    var content = fs.readFileSync(langDir + fileName, 'utf8');

                    var lastPointIndex = fileName.lastIndexOf('.');
                    var languageName = fileName.substr(0, lastPointIndex);

                    content = content.replace(/\\/g, '\\\\');
                    content = content.replace(/\r/g, '');
                    content = content.replace(/\n/g, '\\n');
                    content = content.replace(/"/g, '\\"');
                    result += 'e.setLanguageAsset(\'' + languageName + '\',"' + content + '");';
                }

                result += '}]);</script>';
            }

            return result;
        }))
        .pipe($.replace(/<[a-z]+( [a-z\-]+="[a-zA-Z0-9\- ]+")* [a-z\-]+="((favicon.ico)|(favicon.png)|(tileicon.png)|(touchicon.png))"\/?>/g, ''))
        .pipe(gulp.dest('dist'));
});

gulp.task('process-manifest', function () {
    return gulp.src([
        'dist/css/**',
        'dist/js/**',
        'dist/fonts/fontawesome-webfont.woff2',
        'dist/*.html',
        'dist/*.ico',
        'dist/*.png'
    ], {base: 'dist/'})
        .pipe($.manifest({
            hash: true,
            preferOnline: true,
            network: ['*'],
            filename: 'index.manifest',
            exclude: 'index.manifest'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('process-full-extras', function () {
    return gulp.src([
        'LICENSE',
        'src/*.*',
        '!src/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));
});

gulp.task('process-tiny-extras', function () {
    return gulp.src([
        'LICENSE'
    ]).pipe(gulp.dest('dist'));
});

gulp.task('info', function () {
    return gulp.src([
        'dist/**/*'
    ]).pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build', $.sequence('lint', 'process-fonts', 'process-langs', 'process-assets', 'process-manifest', 'process-full-extras', 'info'));

gulp.task('build-bundle', $.sequence('lint', 'process-assets-bundle', 'process-tiny-extras', 'info'));

gulp.task('serve', ['prepare-styles', 'prepare-scripts', 'prepare-fonts'], function () {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['.tmp', 'src'],
            routes: {
                '/node_modules': 'node_modules'
            }
        }
    });

    gulp.watch([
        'src/*.html',
        'src/*.ico',
        'src/*.png',
        'src/langs/*.txt',
        'src/views/*.html',
        'src/imgs/**/*',
        '.tmp/fonts/**/*'
    ]).on('change', reload);

    gulp.watch('src/styles/**/*.css', ['prepare-styles']);
    gulp.watch('src/scripts/**/*.js', ['prepare-scripts']);
    gulp.watch('src/fonts/**/*', ['prepare-fonts']);
});

gulp.task('serve:dist', function () {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['dist']
        }
    });
});

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});
