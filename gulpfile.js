const gulp = require('gulp');
const requireDir = require('require-dir');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync');
const reload = browserSync.reload;

const DIR = require('./gulp/conf').DIR;

requireDir('./gulp/tasks');

gulp.task('predefault', cb => {
  runSequence(
    'cleanDest',
    'sprite',
    ['pug', 'sass', 'watchify', 'vendorScripts', 'copyToDest'],
    'serve',
    cb
  );
});

gulp.task('default', ['predefault'], () => {
  gulp.watch(
    [`./${DIR.SRC}/**/*.pug`],
    ['pug', reload]
  );

  gulp.watch(
    [`./${DIR.SRC}/**/*.{scss,sass}`],
    ['sass', reload]
  );

  gulp.watch(
    [`./${DIR.DEST}/**/*.js`],
    reload
  );

  gulp.watch(
    [
      `./${DIR.SRC}/img/**/*.*`,
      `./${DIR.SRC}/font/**/*.*`,
    ],
    ['copyToDest', reload]
  );
});

gulp.task('build', cb => {
  runSequence(
    'cleanBuild',
    'sprite',
    ['pug', 'sass'],
    'replaceHtml',
    ['minifyCss', 'browserify', 'vendorScripts', 'imagemin'],
    'uglify',
    'copyToBuild',
    cb
  );
});
