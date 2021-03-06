var path = require('path');
var sassTrue = require('sass-true');

var sass_tests_subdir = 'pattern_library/';

// Test Files
var functionsFile = path.join(__dirname, sass_tests_subdir+'_functions.scss');
/*
var colorFile = path.join(__dirname, sass_tests_subdir+'_color.scss');
var selectorFile = path.join(__dirname, sass_tests_subdir+'_selector.scss');
var unitFile = path.join(__dirname, sass_tests_subdir+'_unit.scss');
var valueFile = path.join(__dirname, sass_tests_subdir+'_value.scss');
var componentsFile = path.join(__dirname, sass_tests_subdir+'_components.scss');
*/

// Run Tests
sassTrue.runSass({file: functionsFile}, describe, it);
/*
sassTrue.runSass({file: colorFile}, describe, it);
sassTrue.runSass({file: selectorFile}, describe, it);
sassTrue.runSass({file: unitFile}, describe, it);
sassTrue.runSass({file: valueFile}, describe, it);
sassTrue.runSass({file: componentsFile}, describe, it);
*/