
import plugins          from 'gulp-load-plugins';
import yargs            from 'yargs';
import yaml             from 'js-yaml';
import fs               from 'fs';

import stripDebug       from 'gulp-strip-debug';
import rimraf           from 'rimraf';

import panini           from 'panini';
import sherpa           from 'style-sherpa';

/** @var gulp */
var gulp           = require('gulp');

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


/** @class Patternlibrary */
var Patternlibrary = require('node-patternlibrary');

/** @var Patternlibrary */
var $PL = null;

/** @var string */
var patternlibraryDestination = PATHS.dist+'/pl/';

// initialize Patternlibrary task
gulp.task('patternlibrary:init', function (done) {
	
	// initialize Patternlibrary
	if (null == $PL) {
		$PL = Patternlibrary({
	        verbose  : true,
	        dest     : patternlibraryDestination,
	        basepath : '/pl',
	        partials : 'src/patterns/'
	    });
	}
    
	// finish task
    done();
    
});

// run Patternlibrary generation
gulp.task('patternlibrary:run', function (done) {
	
	// generate Patternlibrary pages
	if ($PL != null) {
	    // ...go, go $PL ! 
		$PL
		   .run()
		   //.log("PL:", $PL)
		;
	}

	// finish task
    done();
    
});

// refresh patternlibrary dist files and data
gulp.task('patternlibrary:refresh', function (done) {
	$PL.refresh();
    done();
});

// preparations, clear dist-dir, 
gulp.task('patternlibrary:prepare',
	gulp.series(
		'clean:patternlibrary-dist',
        'copy:patternlibrary'
    )
);

// main 'patternlibrary' task
gulp.task('patternlibrary',
	gulp.series(
		'patternlibrary:prepare',
 	    'patternlibrary:init',
 	    'patternlibrary:run'
    )
);
