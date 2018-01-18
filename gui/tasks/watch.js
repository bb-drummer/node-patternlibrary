
import plugins          from 'gulp-load-plugins';
import yargs            from 'yargs';
import browser          from 'browser-sync';
import requireDir       from 'require-dir';
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

//
// Watch for changes to static assets, pages, Sass, and JavaScript
//
function watch(done) {
 
	// watch assets paths
    gulp.watch(PATHS.assets,  gulp.series('copy', browser.reload));
    gulp.watch('src/pages/**/*.html').on('change', gulp.series('pages', browser.reload));
    gulp.watch('src/assets/img/**/*').on('change', gulp.series('images', browser.reload));
    
    // watch partials and pages
    gulp.watch('src/{layouts,partials}/**/*.html').on('change', gulp.series(
    		'pages:refresh', 'pages', 
    		browser.reload
    ));
    
    if (!TESTING) {
        // watch sass and js (no test and lint)
        gulp.watch('src/assets/scss/**/*.scss', gulp.series('sass')); // currently injected, use reload: gulp.series('sass', browser.reload)
        gulp.watch(PATHS.javascript).on('change', gulp.series('javascript', browser.reload));
        gulp.watch('src/assets/js/**/*.js').on('change', gulp.series('javascript', browser.reload));
    }
    if (TESTING) {
        if (LINT) {
            // watch sass and js (plus test and lint)
            gulp.watch('src/assets/scss/**/*.scss', gulp.series(
            		'sass', 'test:sass:lint', 'test:sass:pattern_library'
            ));
            gulp.watch(PATHS.javascript).on('change', gulp.series(
            		'javascript', 'test:javascript:lint', 'test:javascript:pattern_library', 
            		browser.reload
            ));
            gulp.watch('src/assets/js/**/*.js').on('change', gulp.series(
            		'javascript', 'test:javascript:lint', 'test:javascript:pattern_library', 
            		browser.reload
            ));
        } else {
            // watch sass and js (plus test)
            gulp.watch('src/assets/scss/**/*.scss', gulp.series(
            		'sass','test:sass:pattern_library'
            ));
            gulp.watch(PATHS.javascript).on('change', gulp.series(
        		  'javascript', 'test:javascript:pattern_library', 
        		  browser.reload
            ));
            gulp.watch('src/assets/js/**/*.js').on('change', gulp.series(
        		  'javascript', 'test:javascript:pattern_library', 
        		  browser.reload
            ));    
        } 
        // watch test dir changes
        gulp.watch(
            ['test/sass/foundations-sites/**']
        ).on('change', gulp.series('test:sass:foundation'));
        gulp.watch(
            ['test/sass/pattern_library/**']
        ).on('change', gulp.series('test:sass:pattern_library'));
        gulp.watch(
            ['test/javascript/foundations-sites/**']
        ).on('change', gulp.series('test:build-js:foundation', 'test:javascript:foundation'));
        gulp.watch(
            ['test/javascript/pattern_library/**']
        ).on('change', gulp.series('test:build-js:pattern_library', 'test:javascript:pattern_library'));
    }
}

gulp.task(
    'watch', 
    gulp.series(
        watch
    )
);
