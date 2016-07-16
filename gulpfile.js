var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');

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

gulp.task('lint', function () {
  return gulp.src([
    'src/scripts/**/*.js'
  ]).pipe(reload({stream: true, once: true}))
    .pipe($.eslint({fix: true}))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
    .pipe(gulp.dest('src/scripts'));
});

gulp.task('html', ['styles', 'scripts'], function () {
  return gulp.src('src/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'src', '.']}))
    .pipe($.if('js/*.js', $.replace(/\/\/# sourceMappingURL=.*/g, '')))
    .pipe($.if('css/*.css', $.replace(/\/\*# sourceMappingURL=.* \*\/$/g, '')))
    .pipe($.if(['js/moment-with-locales-*.min.js', 'js/plugins.min.js', 'js/aria-ng.min.js'], $.uglify({preserveComments: 'license'})))
    .pipe($.if(['css/plugins.min.css', 'css/aria-ng.min.css'], $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('langs', function () {
  return gulp.src('src/langs/**/*')
    .pipe($.jsonminify())
    .pipe(gulp.dest('dist/langs'));
});

gulp.task('views', function () {
  return gulp.src('src/views/**/*')
    .pipe($.htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist/views'));
});

gulp.task('images', function () {
  return gulp.src('src/imgs/**/*')
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
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([
    'src/*.html',
    'src/langs/*.json',
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

gulp.task('build', ['lint', 'html', 'langs', 'views', 'images', 'fonts', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
