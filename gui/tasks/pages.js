
import plugins          from 'gulp-load-plugins';
import yargs            from 'yargs';
import yaml             from 'js-yaml';
import fs               from 'fs';

import stripDebug       from 'gulp-strip-debug';
import rimraf           from 'rimraf';

import panini           from 'panini';
import sherpa           from 'style-sherpa';
import requireDir       from 'require-dir';

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

requireDir('../src/handlebars/');

//Parse page templates into finished HTML files
gulp.task('pages:main', function () {
    return gulp.src('src/pages/**/*.{html,hbs,handlebars}')
        .pipe(panini({
             root    : 'src/pages/',
             layouts : 'src/layouts/',
             partials: 'src/partials/',
             data    : 'src/data/',
             helpers : 'src/helpers/'
        }))
        .pipe(gulp.dest(PATHS.dist))
        .pipe(gulp.dest(PATHS.patternlibrary+'/pages'));
});


//Load updated HTML templates and partials into Panini
gulp.task('pages:refresh', function (done) {
    panini.refresh();
    done();
});

//Generate a style guide from the Markdown content and HTML template in styleguide/
gulp.task('pages:styleguide', function styleGuide(done) {
    sherpa('src/styleguide/index.md', {
        output  : PATHS.dist + '/styleguide.html',
        template: 'src/styleguide/template.html'
    }, done);
});

gulp.task('pages',
	gulp.series(
 	    'pages:main',
        'pages:styleguide'
    )
);

