
import plugins          from 'gulp-load-plugins';
import yargs            from 'yargs';
import yaml             from 'js-yaml';
import fs               from 'fs';

import stripDebug       from 'gulp-strip-debug';
import rimraf           from 'rimraf';

import rename           from 'gulp-rename';
import replace          from 'replace-in-file';
import requireDir       from 'require-dir';

var gulp = require('gulp');

// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);
const TESTING    = !!(yargs.argv.testing);
const LINT       = !!(yargs.argv.lint);

// Load settings from settings.yml
const { COMPATIBILITY, PORT, UNCSS_OPTIONS, LIBNAMESPACE, PATHS } = loadConfig();

function loadConfig() {
    let ymlFile = fs.readFileSync('config.yml', 'utf8');
    return yaml.load(ymlFile);
}

//Load updated HTML templates and partials into Panini
gulp.task('libnamespace:clean', function (done) {
    rimraf(LIBNAMESPACE.dest, done);
});

//Parse page templates into finished HTML files
gulp.task('libnamespace:copy', function () {
    return gulp.src(LIBNAMESPACE.src)
        .pipe(gulp.dest(LIBNAMESPACE.dest));
});


//Load updated HTML templates and partials into Panini
gulp.task('libnamespace:namespace', function (done) {
	var _from = LIBNAMESPACE.needles.map( function (needle, index) {
		return (new RegExp(needle, 'g'));
	});
	replace.sync({
    	files           : LIBNAMESPACE.dest+'/**/*',
    	from            : _from, // LIBNAMESPACE.needles, // 
    	to              : LIBNAMESPACE.replacements,
    	allowEmptyPaths : true,
    	encoding        : 'utf8'
    });
    done();
});

//Generate a style guide from the Markdown content and HTML template in styleguide/
gulp.task('libnamespace:files', function () {

	return gulp.src(LIBNAMESPACE.src)
	    .pipe(rename( function (path) {
	    	for (var index = 0; index < LIBNAMESPACE.needles.length; index++) {
		    	path.basename = String(path.basename).replace(
		    		LIBNAMESPACE.needles[index],
		    		LIBNAMESPACE.replacements[index]
		        );
	    	}
	    }))
	    .pipe(gulp.dest(LIBNAMESPACE.dest));

});

gulp.task('libnamespace',
	gulp.series(
 	    'libnamespace:clean',
        //'libnamespace:copy',
        'libnamespace:files',
        'libnamespace:namespace'
    )
);

