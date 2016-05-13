var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

gulp.task('styles', function () {
  return gulp.src([
    'app/styles/**/*.css'
  ]).pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', function () {
  return gulp.src([
    'app/scripts/**/*.js'
  ]).pipe($.plumber())
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

gulp.task('lint', function () {
  return gulp.src([
    'app/scripts/**/*.js'
  ]).pipe(reload({stream: true, once: true}))
    .pipe($.eslint({fix: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('html', ['styles', 'scripts'], function () {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('js/*.js', $.replace(/\/\/# sourceMappingURL=.*/g, '')))
    .pipe($.if('css/*.css', $.replace(/\/\*# sourceMappingURL=.* \*\/$/g, '')))
    .pipe($.if(['js/moment-with-locales-*.min.js', 'js/plugins.min.js', 'js/aria-ng.min.js'], $.uglify({preserveComments: 'license'})))
    .pipe($.if(['css/plugins.min.css', 'css/aria-ng.min.css'], $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('views', function () {
  return gulp.src('app/views/**/*')
    .pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist/views'));
});

gulp.task('images', function () {
  return gulp.src('app/imgs/**/*')
    .pipe(gulp.dest('dist/imgs'));
});

gulp.task('fonts', function () {
  return gulp.src([
    'bower_components/bootstrap/fonts/**/*',
    'bower_components/font-awesome/fonts/**/*'
  ]).pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
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
      baseDir: ['.tmp', 'app'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    'app/views/*.html',
    'app/imgs/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.css', ['styles']);
  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('app/fonts/**/*', ['fonts']);
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

gulp.task('build', ['lint', 'html', 'views', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
