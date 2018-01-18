
import plugins          from 'gulp-load-plugins';
import yargs            from 'yargs';
import yaml             from 'js-yaml';
import fs               from 'fs';

import jshint           from 'gulp-eslint';
import mocha            from 'gulp-mocha';
import mochaPhantomJS   from 'gulp-mocha-phantomjs';
import sassLint         from 'gulp-sass-lint';
import gutil            from 'gulp-util';
import eslintHTML       from 'eslint-html-reporter';

import panini           from 'panini';

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
//Test setup
//

//checking SASS syntax and coding-style
function testSASSLint(done) {
  return gulp.src('src/**/*.scss')
      .pipe(sassLint({ 
          configFile: '.sass-lint.yml',
           options: { 
               formatter: 'stylish'
           }
      }))
      .pipe(sassLint.format());
  
  /* return gulp.src('src/** /*.scss')
   /*.pipe(sassLint({ 
       config: '.sass-lint.yml',
       maxBuffer: (10 * 1024 * 1024),
       reporterOutput: '../../../target/pattern_library/report.sass.lint.html',
       reporterOutputFormat: 'html'
      }))* /
   .pipe(sassLint({ 
       configFile: '.sass-lint.yml',
       options: { 
           formatter: 'stylish'
       }
      }))
   .pipe(sassLint.format())
   //.pipe(sassLint.format('../../../target/pattern_library/report.sass.lint.html'))
   /*.pipe(sassLint.format(eslintHTML, function(results) {
        fs.writeFileSync('../../../target/pattern_library/report.javascript.lint.html', results);
      }))* /
;*/
}

function testSASSLintReport(done) {
  var outputfile = fs.createWriteStream('dist/reports/report.sass.lint.html');
  return gulp.src('src/**/*.scss')
      .pipe(sassLint({ 
          configFile: '.sass-lint.yml',
           options: { 
               formatter: 'html',
               outputFile: 'dist/reports/report.sass.lint.html.html'
           }
       }))
       .pipe(sassLint.format(outputfile));
}

gulp.task(
  'test:sass:lint', 
  gulp.parallel(
      testSASSLint,
      testSASSLintReport
  )
);

//checking JS syntax and coding-style
function testJSLint(done) {
  return gulp.src('src/**/*.js')
      .pipe(jshint('.eslintrc'))
      .pipe(jshint.format())
      .pipe(jshint.format(eslintHTML, function(results) {
          fs.writeFileSync('dist/reports/report.javascript.lint.html', results);
      })); 
}

gulp.task(
  'test:javascript:lint', 
  gulp.series(
      testJSLint
  )
);

//checking SASS & JS syntax and coding-style
gulp.task(
  'test:lint', 
  gulp.parallel(
      testSASSLint,
      testJSLint
  )
);

//combine Foundation JS test files
gulp.task('test:build-js:foundation', function(done) {
 rimraf('test/javascript/foundation-sites.js-tests.js', done);
 
 return gulp.src(PATHS.testFoundationJSfiles)
     .pipe($.babel()
         .on('error', e => { console.log(e); }))
     .pipe($.concat('foundation-sites.js-tests.js'))
     .pipe(gulp.dest('test/javascript'));
});

//combine Pattern-Library JS test files
gulp.task('test:build-js:pattern_library', function(done) {
  rimraf('test/javascript/pattern_library.js-tests.js', done);

  return gulp.src(PATHS.testPatternLibraryJSfiles)
      .pipe($.babel()
          .on('error', e => { console.log(e); }))
      .pipe($.concat('pattern_library.js-tests.js'))
      .pipe(gulp.dest('test/javascript'));
});

var configMocha = { 
  reporter: 'spec'
};
//Foundation JS tests
gulp.task('test:javascript:foundation', function(done) {
	configMocha.dump = 'dist/reports/report.javascript.foundation-sites.txt';
	
  return gulp.src(['test/javascript/foundation-sites.html'])
      .pipe(mochaPhantomJS(configMocha))
      .on('error', gutil.log);

});

//Pattern-Library JS tests
gulp.task('test:javascript:pattern_library', function(done) {
	//configMocha.reporter = 'spec';
	configMocha.dump = 'dist/reports/report.javascript.pattern_library.txt';

  return gulp.src(['test/javascript/pattern_library.html'])
      .pipe(mochaPhantomJS(configMocha))
      .on('error', gutil.log);

});


//Foundation SASS tests
gulp.task('test:sass:foundation', function(done) {
	configMocha.dump = 'dist/reports/report.sass.foundation-sites.txt';

  return gulp.src(['test/sass/test_foundation-sites.js'])
      .pipe(mocha(configMocha))
      .on('error', gutil.log);

});

//Pattern-Library SASS tests
gulp.task('test:sass:pattern_library', function(done) {
	configMocha.dump = 'dist/reports/report.sass.pattern_library.txt';

  return gulp.src(['test/sass/test_pattern_library.js'])
      .pipe(mocha(configMocha))
      .on('error', gutil.log);

});



if (!LINT) {
  // all SASS tests
  gulp.task('test:sass', gulp.series(
      'test:sass:foundation',
      'test:sass:pattern_library'
  ));
  
  // all JS tests
  gulp.task('test:javascript', gulp.series(
      'test:javascript:foundation',
      'test:javascript:pattern_library'
  ));
} else {
  // all SASS tests & lint
  gulp.task('test:sass', gulp.series(
      'test:sass:lint',
      'test:sass:foundation',
      'test:sass:pattern_library'
  ));
  
  // all JS tests
  gulp.task('test:javascript', gulp.series(
      'test:javascript:lint',
      'test:javascript:foundation',
      'test:javascript:pattern_library'
  ));
}

//all SASS & JS tests & lint
gulp.task('test:full', gulp.series(
  'test:sass',
  'test:javascript'
));

