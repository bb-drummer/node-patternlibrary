
import plugins          from 'gulp-load-plugins';
import yargs            from 'yargs';
import yaml             from 'js-yaml';
import fs               from 'fs';

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



//Copy files out of the assets folder
//This task skips over the "img", "js", and "scss" folders, which are parsed separately
gulp.task('copy:assets', function () {
    return gulp.src(PATHS.assets)
        .pipe(gulp.dest(PATHS.dist + '/assets'))
        .pipe(gulp.dest(PATHS.dist + '/assets/vendor/patternlibrary'));
});

gulp.task('copy:patternlibrary-json', function () {
    return gulp.src('../../themes/foundation-theme-base/dist/pl/patternlibrary.json')
        .pipe( $.if( !PRODUCTION, gulp.dest(PATHS.dist + '/pl') ) );
});

gulp.task('copy:search-json', function () {
    return gulp.src('../../themes/foundation-theme-base/dist/pl/search.json')
        .pipe( $.if( !PRODUCTION, gulp.dest(PATHS.dist + '/pl') ) );
});

gulp.task('copy',
    gulp.series(
 	    'clean:assets',
        gulp.parallel(
            'copy:assets' /*,
            'copy:patternlibrary-json',
            'copy:search-json'*/
        )
    )
);


