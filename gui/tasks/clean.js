
import plugins          from 'gulp-load-plugins';
import yargs            from 'yargs';
import yaml             from 'js-yaml';
import fs               from 'fs';

import rimraf           from 'rimraf';

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



// Delete the "dist" folder
// This happens every time a build starts
gulp.task('clean:dist', function (done) {
    rimraf(PATHS.dist, done);
});

//Delete the "dist/assets" folder
//This happens every time a build starts
gulp.task('clean:assets', function (done) {
    rimraf(PATHS.dist + '/assets', done);
});

gulp.task('clean',
    gulp.series(
 	    'clean:dist',
        'clean:assets'
    )
);


