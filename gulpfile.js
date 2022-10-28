const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');
const fs = require('fs');
const git = require('git-rev-sync');
const tryFn = require('nice-try');
const saveLicense = require('uglify-save-license');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('clean', () => del(['.tmp', 'dist']));

gulp.task('lint', () => gulp.src([
    'src/scripts/**/*.js'
]).pipe(reload({stream: true, once: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
    .pipe(gulp.dest('src/scripts')));

gulp.task('prepare-fonts', () => gulp.src([
    'node_modules/font-awesome/fonts/fontawesome-webfont.*'
]).pipe(gulp.dest('.tmp/fonts')));

gulp.task('process-fonts', gulp.series('prepare-fonts', () => gulp.src([
    '.tmp/fonts/**/*'
]).pipe(gulp.dest('dist/fonts'))));

gulp.task('prepare-langs', () => gulp.src([
    'src/langs/**/*'
]).pipe(gulp.dest('.tmp/langs')));

gulp.task('process-langs', gulp.series('prepare-langs', () => gulp.src([
    '.tmp/langs/**/*'
]).pipe(gulp.dest('dist/langs'))));

gulp.task('prepare-styles', () => gulp.src([
    'src/styles/**/*.css'
]).pipe($.autoprefixer())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true})));

gulp.task('prepare-scripts', () => gulp.src([
    'src/scripts/**/*.js'
]).pipe($.plumber())
    .pipe($.injectVersion({replace: '${ARIANG_VERSION}'}))
    .pipe($.replace(/\${ARIANG_BUILD_COMMIT}/g, tryFn(git.short) || 'Local'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true})));

gulp.task('prepare-views', () => gulp.src([
    'src/views/**/*.html'
]).pipe($.htmlmin({collapseWhitespace: true}))
    .pipe($.angularTemplatecache({module: 'ariaNg', filename: 'views/templates.js', root: 'views/'}))
    .pipe(gulp.dest('.tmp/scripts')));

gulp.task('prepare-html', gulp.series('prepare-styles', 'prepare-scripts', 'prepare-views', () => gulp.src([
    'src/*.html'
]).pipe($.useref({searchPath: ['.tmp', 'src', '.']}))
    .pipe($.if('js/*.js', $.replace(/\/\/# sourceMappingURL=.*/g, '')))
    .pipe($.if('css/*.css', $.replace(/\/\*# sourceMappingURL=.* \*\/$/g, '')))
    .pipe($.if(['js/moment-with-locales-*.min.js', 'js/plugins.min.js', 'js/aria-ng.min.js'], $.uglify({output: {comments: saveLicense}})))
    .pipe($.if(['css/plugins.min.css', 'css/aria-ng.min.css'], $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.replace(/url\((\.\.\/fonts\/[a-zA-Z0-9\-]+\.woff2)(\?[a-zA-Z0-9\-_=.]+)?\)/g, (match, fileName) => {
        return 'url(' + fileName + ')'; // remove version of woff2 file (woff2 file should be cached via application cache)
    }))
    .pipe($.if(['js/plugins.min.js', 'js/aria-ng.min.js', 'css/plugins.min.css', 'css/aria-ng.min.css'], $.rev()))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe($.revReplace())
    .pipe(gulp.dest('.tmp'))));

gulp.task('process-html', gulp.series('prepare-html', () => gulp.src([
    '.tmp/*.html'
]).pipe($.replace(/<!-- AriaNg-Bundle:\w+ -->/, ''))
    .pipe(gulp.dest('dist'))));

gulp.task('process-assets', gulp.series('process-html', () => gulp.src([
    '.tmp/css/**/*',
    '.tmp/js/**/*'
], {base: '.tmp'})
    .pipe(gulp.dest('dist'))));

gulp.task('prepare-assets-bundle', () => gulp.src([
    'src/favicon.png'
]).pipe(gulp.dest('.tmp')));

gulp.task('process-assets-bundle', gulp.series('prepare-fonts', 'prepare-langs', 'prepare-html', 'prepare-assets-bundle', () => gulp.src('.tmp/index.html')
    .pipe($.replace(/<link rel="stylesheet" href="(css\/[a-zA-Z0-9\-_.]+\.css)">/g, (match, fileName) => {
        const content = fs.readFileSync('.tmp/' + fileName, 'utf8');
        return '<style type="text/css">' + content + '</style>';
    }))
    .pipe($.replace(/<script src="(js\/[a-zA-Z0-9\-_.]+\.js)"><\/script>/g, (match, fileName) => {
        const content = fs.readFileSync('.tmp/' + fileName, 'utf8');
        return '<script type="application/javascript">' + content + '</script>';
    }))
    .pipe($.replace(/url\(\.\.\/(fonts\/[a-zA-Z0-9\-]+\.woff)(\?[a-zA-Z0-9\-_=.]+)?\)/g, (match, fileName) => {
        if (!fs.existsSync('.tmp/' + fileName)) {
            return match;
        }

        const contentBuffer = fs.readFileSync('.tmp/' + fileName);
        const contentBase64 = contentBuffer.toString('base64');
        return 'url(data:application/x-font-woff;base64,' + contentBase64 + ')';
    }))
    .pipe($.replace(/<link rel="icon" href="([a-zA-Z0-9\-_.]+\.png)">/g, (match, fileName) => {
        if (!fs.existsSync('.tmp/' + fileName)) {
            return match;
        }

        const contentBuffer = fs.readFileSync('.tmp/' + fileName);
        const contentBase64 = contentBuffer.toString('base64');
        return '<link rel="icon" href="data:image/png;base64,' + contentBase64 + '">';
    }))
    .pipe($.replace('<!-- AriaNg-Bundle:languages -->', () => {
        const langDir = '.tmp/langs/';
        let result = '';
        const fileNames = fs.readdirSync(langDir, 'utf8');

        if (fileNames.length > 0) {
            result = '<script type="application/javascript">' +
                'angular.module("ariaNg").config(["ariaNgAssetsCacheServiceProvider",function(e){';

            for (const fileName of fileNames) {
                let content = fs.readFileSync(langDir + fileName, 'utf8');

                const lastPointIndex = fileName.lastIndexOf('.');
                const languageName = fileName.substr(0, lastPointIndex);

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
    .pipe($.replace(/<[a-z]+( [a-z\-]+="[a-zA-Z0-9\- ]+")* [a-z\-]+="((favicon.ico)|(tileicon.png)|(touchicon.png))"\/?>/g, ''))
    .pipe(gulp.dest('dist'))));

gulp.task('process-full-extras', () => gulp.src([
    'LICENSE',
    'src/*.*',
    '!src/*.html'
], {
    dot: true
}).pipe(gulp.dest('dist')));

gulp.task('process-tiny-extras', () => gulp.src([
    'LICENSE'
]).pipe(gulp.dest('dist')));

gulp.task('info', () => gulp.src([
    'dist/**/*'
]).pipe($.size({title: 'build', gzip: true})));

gulp.task('build', gulp.series('lint', 'process-fonts', 'process-langs', 'process-assets', 'process-full-extras', 'info'));

gulp.task('build-bundle', gulp.series('lint', 'process-assets-bundle', 'process-tiny-extras', 'info'));

gulp.task('serve', gulp.series('prepare-styles', 'prepare-scripts', 'prepare-fonts', () => {
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

    gulp.watch('src/styles/**/*.css', gulp.series('prepare-styles'));
    gulp.watch('src/scripts/**/*.js', gulp.series('prepare-scripts'));
    gulp.watch('src/fonts/**/*', gulp.series('prepare-fonts'));
}));

gulp.task('serve:dist', () => {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['dist']
        }
    });
});

gulp.task('default', gulp.series('clean', 'build'));
