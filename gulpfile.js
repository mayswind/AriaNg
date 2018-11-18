var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');
var fs = require('fs');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

gulp.task('styles', function () {
    return gulp.src([
        'src/styles/**/*.css'
    ]).pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe(reload({stream: true}));
});

gulp.task('scripts', function () {
    return gulp.src([
        'src/scripts/**/*.js'
    ]).pipe($.plumber())
        .pipe(gulp.dest('.tmp/scripts'))
        .pipe(reload({stream: true}));
});

gulp.task('views', function () {
    return gulp.src([
        'src/views/**/*.html'
    ]).pipe($.htmlmin({collapseWhitespace: true}))
        .pipe($.angularTemplatecache({module: 'ariaNg', filename: 'views/templates.js', root: 'views/'}))
        .pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('lint', function () {
    return gulp.src([
        'src/scripts/**/*.js'
    ]).pipe(reload({stream: true, once: true}))
        .pipe($.eslint.format())
        .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
        .pipe(gulp.dest('src/scripts'));
});

gulp.task('html', ['styles', 'scripts', 'views'], function () {
    return gulp.src([
        'src/*.html'
    ]).pipe($.useref({searchPath: ['.tmp', 'src', '.']}))
        .pipe($.injectVersion())
        .pipe($.if('js/*.js', $.replace(/\/\/# sourceMappingURL=.*/g, '')))
        .pipe($.if('css/*.css', $.replace(/\/\*# sourceMappingURL=.* \*\/$/g, '')))
        .pipe($.if(['js/moment-with-locales-*.min.js', 'js/plugins.min.js', 'js/aria-ng.min.js'], $.uglify({preserveComments: 'license'})))
        .pipe($.if(['css/plugins.min.css', 'css/aria-ng.min.css'], $.cssnano({safe: true, autoprefixer: false})))
        .pipe($.if(['js/plugins.min.js', 'js/aria-ng.min.js', 'css/plugins.min.css', 'css/aria-ng.min.css'], $.rev()))
        .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
        .pipe($.revReplace())
        .pipe(gulp.dest('dist'));
});

gulp.task('langs', function () {
    return gulp.src([
        'src/langs/**/*'
    ]).pipe(gulp.dest('dist/langs'));
});

gulp.task('images', function () {
    return gulp.src([
        'src/imgs/**/*'
    ]).pipe(gulp.dest('dist/imgs'));
});

gulp.task('fonts', function () {
    return gulp.src([
        'node_modules/font-awesome/fonts/fontawesome-webfont.*'
    ]).pipe(gulp.dest('.tmp/fonts'))
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('manifest', function () {
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

gulp.task('extras', function () {
    return gulp.src([
        'LICENSE',
        'src/*.*',
        '!src/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'scripts', 'fonts'], function () {
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

    gulp.watch('src/styles/**/*.css', ['styles']);
    gulp.watch('src/scripts/**/*.js', ['scripts']);
    gulp.watch('src/fonts/**/*', ['fonts']);
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

gulp.task('info', function () {
    return gulp.src([
        'dist/**/*'
    ]).pipe($.size({title: 'build', gzip: true}));
});

gulp.task('build', $.sequence('lint', 'html', 'langs', 'images', 'fonts', 'manifest', 'extras', 'info'));

gulp.task('bundle-assets', function () {
    return gulp.src('dist/index.html')
        .pipe($.replace(/<link rel="stylesheet" href="(css\/[a-zA-Z0-9\-_.]+\.css)">/g, function(match, fileName) {
            var content = fs.readFileSync('dist/' + fileName, 'utf8');
            return '<style type="text/css">' + content + '</style>';
        }))
        .pipe($.replace(/<script src="(js\/[a-zA-Z0-9\-_.]+\.js)"><\/script>/g, function(match, fileName) {
            var content = fs.readFileSync('dist/' + fileName, 'utf8');
            return '<script type="application/javascript">' + content + '</script>';
        }))
        .pipe($.replace(/url\(\.\.\/(fonts\/[a-zA-Z0-9\-]+\.woff)(\?[a-zA-Z0-9\-_=.]+)?\)/g, function(match, fileName) {
            if (!fs.existsSync('dist/' + fileName)) {
                return match;
            }

            var contentBuffer = fs.readFileSync('dist/' + fileName);
            var contentBase64 = contentBuffer.toString('base64');
            return 'url(data:application/x-font-woff;base64,' + contentBase64 + ')';
        }))
        .pipe($.replace(/<\/body>/g, function(match) {
            var langDir = 'src/langs/';
            var result = '</body>';
            var fileNames = fs.readdirSync(langDir, 'utf8');

            if (fileNames.length > 0) {
                var script = '<script type="application/javascript">' +
                    'angular.module("ariaNg").config(["ariaNgAssetsCacheServiceProvider",function(e){';

                for (var i = 0; i < fileNames.length; i++) {
                    var fileName = fileNames[i];
                    var content = fs.readFileSync(langDir + fileName, 'utf8');

                    var lastPointIndex = fileName.lastIndexOf('.');
                    var languageName = fileName.substr(0, lastPointIndex);

                    content = content.replace(/\n/g, '\\n');
                    content = content.replace(/"/g, '\\"');
                    script += 'e.setLanguageAsset(\'' + languageName + '\',"' + content + '");';
                }

                script += '}]);</script>';
                result = script + result;
            }

            return result;
        }))
        .pipe($.replace(/<[a-z]+( [a-z\-]+="[a-zA-Z0-9\- ]+")* [a-z\-]+="((favicon.ico)|(favicon.png)|(tileicon.png)|(touchicon.png))"\/?>/g, ''))
        .pipe(gulp.dest('dist'));
});

gulp.task('bundle-extras', function () {
    return gulp.src([
        'LICENSE'
    ]).pipe(gulp.dest('dist'));
});

gulp.task('bundle-clean', del.bind(null, ['dist/css', 'dist/js', 'dist/fonts']));

gulp.task('build-bundle', $.sequence('lint', 'html', 'images', 'fonts', 'bundle-assets', 'bundle-extras', 'bundle-clean', 'info'));

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});
