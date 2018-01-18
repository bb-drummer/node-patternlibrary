
import plugins          from 'gulp-load-plugins';
import yargs            from 'yargs';
import yaml             from 'js-yaml';
import fs               from 'fs';

import stripDebug       from 'gulp-strip-debug';

import jshint           from 'gulp-eslint';
import gutil            from 'gulp-util';
import eslintHTML       from 'eslint-html-reporter';

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


//Combine JavaScript into one file
//In production, the file is minified
gulp.task('javascript:vendor', function () {
  return gulp.src(PATHS.vendor_js)
      .pipe($.sourcemaps.init())
      //.pipe($.babel())
      .pipe($.concat('vendor.js'))
      .pipe($.if(PRODUCTION, stripDebug() ))
      .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
      .pipe(gulp.dest(PATHS.dist + '/assets/js/'))
      .pipe(gulp.dest(PATHS.dist + '/assets/vendor/patternlibrary/js'))
      .pipe(gulp.dest(PATHS.patternlibrary + '/assets/js'));
});


//Combine JavaScript into one file
//In production, the file is minified
gulp.task('javascript:main', function () {
    return gulp.src(PATHS.javascript)
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.concat('patternlibrary-frontend.js'))
        .pipe($.if(PRODUCTION, stripDebug() ))
        .pipe($.if(PRODUCTION, $.uglify()
            .on('error', e => { console.log(e); })
        ))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest(PATHS.dist + '/assets/js'))
        .pipe(gulp.dest(PATHS.dist + '/assets/vendor/patternlibrary/js'))
        .pipe(gulp.dest(PATHS.patternlibrary + '/assets/js'));
});

gulp.task('javascript',
	    gulp.parallel(
	 	    'javascript:vendor',
	        'javascript:main'
	    )
	);

