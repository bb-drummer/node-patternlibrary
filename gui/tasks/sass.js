
import plugins          from 'gulp-load-plugins';
import yargs            from 'yargs';
import yaml             from 'js-yaml';
import fs               from 'fs';

import stripDebug       from 'gulp-strip-debug';

import sassLint         from 'gulp-sass-lint';
import gutil            from 'gulp-util';
import browser          from 'browser-sync';

var gulp = require('gulp');

// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);
const TESTING    = !!(yargs.argv.testing);
const LINT       = !!(yargs.argv.lint);

// Load settings from settings.yml
const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS } = loadConfig();

function loadConfig() {
    let ymlFile = fs.readFileSync('config.yml', 'utf8');
    return yaml.load(ymlFile);
}



//Compile Sass into CSS
//In production, the CSS is compressed
gulp.task('sass:compile', function () {
    return gulp.src('src/assets/scss/patternlibrary.scss')
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            includePaths: PATHS.sass
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({
            browsers: COMPATIBILITY
        }))
        // Comment in the pipe below to run UnCSS in production
        //.pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
        .pipe($.if(PRODUCTION, $.cssnano({svgo: false}) ))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write() ))
        .pipe(gulp.dest(PATHS.dist + '/assets/css'))
        .pipe(gulp.dest(PATHS.dist + '/assets/vendor/patternlibrary/css'))
        .pipe(gulp.dest(PATHS.patternlibrary + '/assets/css'))
        .pipe(browser.reload({ stream: true }))
    ;
});

gulp.task('sass:combinecss', function () {
	return gulp.src(['src/assets/css/font-awesome.min.css', PATHS.dist + '/assets/css/patternlibrary.css'])
	    .pipe($.concat('patternlibrary.css'))
	    .pipe(gulp.dest(PATHS.dist + '/assets/css/'))
        .pipe(gulp.dest(PATHS.dist + '/assets/vendor/patternlibrary/css'))
        .pipe(gulp.dest(PATHS.patternlibrary + '/assets/css'))
    ;
});

gulp.task('sass',
	    gulp.series(
	 	    'sass:compile',
	        'sass:combinecss'
	    )
	);


