'use strict';

import plugins          from 'gulp-load-plugins';
import yargs            from 'yargs';
import yaml             from 'js-yaml';
import fs               from 'fs';

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



// Start a server with BrowserSync to preview the site in
gulp.task('server', function (done) {
    browser.init({
        server: PATHS.dist, port: PORT
    });
    done();
});

// Reload the browser with BrowserSync
gulp.task('reload', function (done) {
    browser.reload();
    done();
});

