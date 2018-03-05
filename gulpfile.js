const gulp       = require('gulp'),
    postcss      = require('gulp-postcss'),
    sass         = require('gulp-sass'),
    autoprefixer = require('autoprefixer'),
    browser      = require('browser-sync'),
    sourcemaps   = require('gulp-sourcemaps'),
    imagemin     = require('gulp-imagemin'),
    iconfont     = require('gulp-iconfont'),
    consolidate  = require('gulp-consolidate');
    svgstore     = require('gulp-svgstore'),
    svgmin       = require('gulp-svgmin'),
    path         = require('path');

	// Добавить gulp-svgstore

gulp.task('sass', () => {
    return gulp.src('sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('_build/assets/css'))
        .pipe(browser.stream({match: '**/*.css'}));
});

gulp.task("build:icons", () => {
    gulp.src(["./assets/icons/*.svg"])//path to svg icons
        .pipe(iconfont({
            fontName: "myicons",
            formats: ["ttf", "eot", "woff", "woff2", "svg"],
            centerHorizontally: true,
            fixedWidth: true,
            fontHeight: 10000,
            normalize: true
        }))
        .on('glyphs', (glyphs) => {

            gulp.src("./assets/icons/util/*.scss") // Template for scss files
                .pipe(consolidate("lodash", {
                    glyphs: glyphs,
                    fontName: "myicons",
                    fontPath: "../fonts/"
                }))
                .pipe(gulp.dest("./sass/icons/"));//generated scss files with classes
        })
        .pipe(gulp.dest("_build/assets/fonts/"));//icon font destination
});


gulp.task('image-min', () => {
        gulp.src('images/*')
            .pipe(imagemin())
            .pipe(gulp.dest('_build/assets/images'))
    }
);

// Builds the documentation and framework files
//gulp.task('build', ['clean', 'sass', 'javascript']);

// Starts a BrowerSync instance
gulp.task('serve', ['sass'], () => {
    browser.init({
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('svgstore', () => {
    return gulp
        .src('assets/icons/*.svg')
        .pipe(svgmin((file) => {
            const prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore())
        .pipe(gulp.dest('_build/assets/icons'));
});

// Runs all of the above tasks and then waits for files to change
gulp.task('default', ['serve'], () => {
    gulp.watch(['sass/**/*.scss'], ['sass']);
    gulp.watch('./**/*.html').on('change', browser.reload);
});