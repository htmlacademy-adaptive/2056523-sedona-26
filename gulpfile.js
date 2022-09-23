import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstory from 'gulp-svgstore';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import {deleteAsync} from 'del';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

//HTML

const html = () => {
  return gulp.src('source/*.html')

  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest('build'));
}

//Scripts

const scripts = () => {
  return gulp.src('source/js/script.js')
  .pipe (gulp.dest('build/js'))
  .pipe(browser.stream());
}

//Images

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(squoosh())
  .pipe(gulp.dest('build/img'));
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(gulp.dest('build/img'))
}

//WrbP

const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')

  .pipe(squoosh({
    webp: {}
  }))
  .pipe(gulp.dest('build/img'));
}

//SVG

const svg = () => {
  gulp.src(['source/img/*.svg', '!source/img/icon/*.svg'])

  .pipe(svgo())
  .pipe(gulp.dest('build/img'));
}

const sprite = () => {
  return gulp.src('source/img/icon/*.svg')

  .pipe(svgo())
  .pipe(svgstory({
    inlineSvg: true
  }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img'));
}


// Server

function server(done) {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

//Copy

export const copy = (done) => {
  gulp.src([
    'source/fonts/*.{woff2,woff}',
    'source/*.ico',
  ], {
    base: 'source'
  })
  .pipe(gulp.dest('build'))
  done();
}

//Clean

export const clean = () => {
  return deleteAsync('build');
};

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
  gulp.watch('sourse/js/script.js', gulp.series(scripts));
}

//Build

export const build = gulp.series (
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ));


// Defoult

export default gulp.series (
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
));
