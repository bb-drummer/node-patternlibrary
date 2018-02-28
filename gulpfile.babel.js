'use strict';

import plugins       from 'gulp-load-plugins';
import yargs         from 'yargs';
import browser       from 'browser-sync';
import gulp          from 'gulp';
import path          from 'path';
import panini        from 'panini';
import rimraf        from 'rimraf';
import sherpa        from 'style-sherpa';
import yaml          from 'js-yaml';
import fs            from 'fs';
import webpackStream from 'webpack-stream';
import webpack2      from 'webpack';
import named         from 'vinyl-named';

import concat           from 'gulp-concat';
import rename           from 'gulp-rename';
import replace          from 'replace-in-file';
import requireDir       from 'require-dir';

// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

// Load settings from settings.yml
const { COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS, LIBNAMESPACE } = loadConfig();

function loadConfig() {
  let ymlFile = fs.readFileSync('gui/config.yml', 'utf8');
  return yaml.load(ymlFile);
}

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
  rimraf(PATHS.dist, done);
}

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
function copy() {
  return gulp.src(PATHS.assets)
    .pipe(gulp.dest(PATHS.dist + '/assets'));
}

function copyDevData() {
	  return gulp.src('gui/src/data/*.*')
	    .pipe(gulp.dest(PATHS.dist + '/pl'));
	}

// Copy page templates into finished HTML files
function pages() {
  if ($PL && $PL.Panini) {
	  $PL.Panini.refresh();
	  return gulp.src([
		  'gui/src/pages/**/*.{html,hbs,handlebars}',
		  '!gui/src/pages/pl/**/*.{html,hbs,handlebars}'
		  
	  ])
	    .pipe($PL.Panini.render())
	    .pipe(gulp.dest(PATHS.dist))
	  ;
  } else {
	  return gulp.src([
		  'gui/src/pages/**/*.{html,hbs,handlebars}',
		  '!gui/src/pages/pl/{dashboard,patterndocs}.html',
		  '!gui/src/pages/pl/{patterns,atoms,molecules,organisms,categories}/**/*.{html,hbs,handlebars}'
		  
	  ])
	    .pipe(panini({
	      root    : 'gui/src/pages/',
	      layouts : 'gui/src/layouts/',
	      partials: 'gui/src/partials/',
	      data    : 'gui/src/data/',
	      helpers : 'gui/src/helpers/'
	    }))
	    .pipe(gulp.dest(PATHS.dist));
  }
}

// Load updated HTML templates and partials into Panini
function resetPages(done) {
  panini.refresh();
  done();
}

// Generate a style guide from the Markdown content and HTML template in styleguide/
function styleGuide(done) {
  sherpa('gui/src/styleguide/index.md', {
    output: PATHS.dist + '/styleguide.html',
    template: 'gui/src/styleguide/template.html'
  }, done);
}

// Compile Sass into CSS
// In production, the CSS is compressed
function sass() {
  return gulp.src('gui/src/assets/scss/patternlibrary.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: PATHS.sass
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    // Comment in the pipe below to run UnCSS in production
    //.pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
    .pipe($.if(PRODUCTION, $.cleanCss({ compatibility: 'ie9' })))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + '/assets/css'))
    .pipe(browser.reload({ stream: true }));
}

let webpackConfig = {
  module: {
    rules: [
      {
        test: /.js$/,
        //exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  }
}


// Combine JavaScript into one file
// In production, the file is minified
function javascript() {
  return gulp.src(PATHS.entries)
    .pipe(named())
    .pipe($.sourcemaps.init())
    .pipe(webpackStream(webpackConfig, webpack2))
    .pipe($.if(PRODUCTION, $.uglify()
      .on('error', e => { console.log(e); })
    ))
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}

//Combine JavaScript dependencies into one file
function javascriptVendors() {
  return gulp.src(PATHS.vendors)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(PATHS.dist + '/assets/js'));
}



// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
  return gulp.src('gui/src/assets/img/**/*')
    .pipe($.if(PRODUCTION, $.imagemin({
      progressive: true
    })))
    .pipe(gulp.dest(PATHS.dist + '/assets/img'));
}

// Start a server with BrowserSync to preview the site in
function server(done) {
  browser.init({
    server: PATHS.dist, port: PORT
  });
  done();
}

// Reload the browser with BrowserSync
function reload(done) {
  browser.reload();
  done();
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


/** @var Patternlibrary */
var $PL = null;

/** @var string */
var patternlibraryBaseURL = '/pl';

/** @var string */
var patternlibraryDestination = path.join(PATHS.dist, patternlibraryBaseURL);

// copy patternlibrary assets
gulp.task('copy:patternlibrary-assets', function () {
	return gulp.src(PATHS.patternlibrary_guiassets + '/**/*')
        .pipe(gulp.dest(PATHS.dist + PATHS.patternlibrary_assetspath));
});

// copy patternlibrary pages to dist folder
gulp.task('copy:patternlibrary-pages', function () {
	return gulp.src([
		PATHS.patternlibrary_gui + '/src/pages/patternlibrary.html'
	])
    .pipe(gulp.dest('src/pages/pl'));
});

//copy patternlibrary files
gulp.task('copy:patternlibrary',
	gulp.series(
	    //'clean:patternlibrary-assets',
        gulp.parallel(
            'copy:patternlibrary-assets' /*,
            'copy:patternlibrary-pages' */
        )
    )
);

// clear patternlibrary dist folder
gulp.task('clean:patternlibrary-dist', function (done) {
    rimraf(path.join(PATHS.dist, patternlibraryBaseURL), done);
});

// clear patternlibrary assets folder
gulp.task('clean:patternlibrary-assets', function (done) {
  rimraf(PATHS.dist + PATHS.patternlibrary_assetspath, done);
});

// refresh patternlibrary dist files and data
gulp.task('patternlibrary:refresh', function (done) {
	$PL.refresh();
    done();
});

// preparations, clear dist-dir, 
gulp.task('patternlibrary:prepare',
	gulp.series(
		'clean:patternlibrary-dist' /*,
        'copy:patternlibrary' */
    )
);

//initialize Patternlibrary task
gulp.task('patternlibrary:init', function (done) {
	
	// initialize Patternlibrary
	//if (null == $PL) {
	/** @class Patternlibrary */
	var Patternlibrary = require('.');
	    $PL = null; 
		$PL = Patternlibrary({
	        verbose  : true,
	        dest     : PATHS.dist,
	        basepath : patternlibraryBaseURL,
	        /*partials : 'src/patterns/' */
	        root     : 'gui/src/pages/',
	        layouts  : 'gui/src/layouts/',
	        partials : 'gui/src/partials/',
	        data     : 'gui/src/data/',
	        helpers  : 'gui/src/helpers/'
	    });
	//}
    
	// finish task
    done();
    
});

// run Patternlibrary generation
gulp.task('patternlibrary:run', function (done) {
	
	// generate Patternlibrary pages
	if ($PL != null) {
	    // ...go, go $PL ! 
		return $PL
		   .run()
		   //.log("PL:", $PL)
		;
	}

	// finish task
    done();
    
});

//run Patternlibrary generation
gulp.task('patternlibrary:re-run', gulp.series(
		'patternlibrary:init', 
		'patternlibrary:run'
));

// main 'patternlibrary' task
gulp.task('patternlibrary',
	gulp.series(
		'patternlibrary:prepare',
 	    'patternlibrary:init',
 	    'patternlibrary:run'
    )
);

// Build the "dist" folder by running all of the below tasks
gulp.task('build',
 gulp.series(clean, 'libnamespace', gulp.parallel(gulp.series(/*pages,*/ 'patternlibrary'), sass, javascript, javascriptVendors, images, copy/*, copyDevData*/), styleGuide));

// Build the site, run the server, and watch for file changes
gulp.task('default',
  gulp.series('build', server, watch)); // )); // 


// Watch for changes to static assets, pages, Sass, and JavaScript
function watch() {
  gulp.watch(PATHS.assets, copy);
  gulp.watch('gui/data/*.json').on('all', gulp.series(copyDevData, browser.reload));
  gulp.watch('gui/src/pages/**/*.html').on('all', gulp.series(gulp.series(/*pages,*/ 'patternlibrary:re-run'), browser.reload));
  gulp.watch('gui/src/{layouts,partials}/**/*.{html,md}').on('all', gulp.series(resetPages, gulp.series(/*pages,*/ 'patternlibrary:re-run'), browser.reload));
  gulp.watch('gui/src/assets/scss/**/*.scss').on('all', sass);
  gulp.watch('gui/src/assets/*/**/*.js').on('all', gulp.series(javascript, browser.reload));
  gulp.watch('gui/src/assets/img/**/*').on('all', gulp.series(images, browser.reload));
  gulp.watch('gui/src/styleguide/**').on('all', gulp.series(styleGuide, browser.reload));
}
