
import plugins          from 'gulp-load-plugins';
import yargs            from 'yargs';
import yaml             from 'js-yaml';
import fs               from 'fs';

import stripDebug       from 'gulp-strip-debug';
import rimraf           from 'rimraf';

import panini           from 'panini';
import sherpa           from 'style-sherpa';

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



// clean GUI target dir
gulp.task('deploy:clean', function ( done ) {
	rimraf(PATHS.patternlibrary+'/**/*', done);
});

// deploy GUI asset files
gulp.task('deploy:assets', function () {
    return gulp.src(PATHS.dist+'/assets/{css,js,fonts,img,vendor}/**/*')
        .pipe(gulp.dest(PATHS.patternlibrary+'/assets'));
});

// deploy GUI page files
gulp.task('deploy:pages', function () {
 return gulp.src('src/pages/**/*')
     .pipe(gulp.dest(PATHS.patternlibrary+'/src/pages'));
});

// deploy GUI layout files
gulp.task('deploy:layouts', function () {
 return gulp.src('src/layouts/**/*')
     .pipe(gulp.dest(PATHS.patternlibrary+'/src/layouts'));
});

// deploy GUI partial files
gulp.task('deploy:partials', function () {
 return gulp.src('src/partials/**/*')
     .pipe(gulp.dest(PATHS.patternlibrary+'/src/partials'));
});


gulp.task('deploy',
	gulp.series(
	 	'deploy:clean',
		gulp.parallel(
			'deploy:assets',
		 	'deploy:layouts',
		 	'deploy:pages',
            'deploy:partials'
	 	)
    )
);

