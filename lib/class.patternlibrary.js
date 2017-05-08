var extend  = require('deep-extend');
var fm      = require('front-matter');
var fs      = require('fs');
var glob    = require('glob');
var path    = require('path');
var through = require('through2');
var slash   = require('slash');

var Panini  = require('panini'); 

//import Panini from 'panini'; 
/**
 * Patternlibrary Generator
 * 
 * @package Patternlibrary
 * @namespace Patternlibrary
 * @author Björn Bartels <me@bjoernbartels.earth>
 */
class Patternlibrary {
	
	/**
	 * Initializes an instance of Patternlibrary.
	 * @constructor
	 * @param {object} options - Configuration options to use.
	 */
	constructor ( options ) {
		
		this.options = extend(this.defaults, options);

		if (!this.options.dirs) {
		    throw new Error('Patternlibrary error: you must specify the directories for patterns.');
		}

		if (!this.options.panini) {
		    throw new Error('Patternlibrary error: you must specify the panini options.')
		}
		
		this.layouts = {};
		
	    this.data = {};
		
		this._init();

		//console.log('options: ', this.options);
		//console.log('data: ', this.data);
    	//console.log('panini:', this.Panini);
		
	}
	
	/**
	 * initialize pattern-library object
	 */
	_init ( ) {

		this._initPanini();
		this.Handlebars = this.Panini.Handlebars;
		
		var partialsPath = this.options.panini.partials;
		
		// gather partials
		this.registerPatternPartials(partialsPath);
		// gather pattern-library meta data
		this.registerPatternData(partialsPath);
		
	}
	
	/**
	 * retrieve ('front-matter') meta data from file
	 * 
	 * @param file patternfile
	 * @return object
	 */
	patternFile ( patternfile ) {
		
	    var pattern = fm(patternfile.toString());
		return (pattern);
		
	}
	
	/**
	 * register path-based partial names to 'handlebars'
	 * 
	 * @param string dir
	 */
	registerPatternPartials ( dir ) {
		
	    var partials = this._readdir(dir, '**/*.{html,hbs,handlebars}');

	    for (var i in partials) {

	        var ext  = path.extname(partials[i]);
	        var file = fs.readFileSync(partials[i]);
	        var name = path.basename(partials[i], ext);
	        
            var pattern = this.patternFile(file);
		    if ( pattern.attributes.pattern && (pattern.attributes.pattern.name != '') ) {
		        this.Handlebars.registerPartial(pattern.attributes.pattern.name, pattern.body + '\n');
	        }
		    
	    }

	}
	
	/**
	 * register pattern data from file info
	 * 
	 * @param string dir
	 */
	registerPatternData ( dir ) {
		
	    var partials = this._readdir(dir, '**/*.{html,hbs,handlebars}');

	    for (var i in partials) {

	        var ext  = path.extname(partials[i]);
	        var file = fs.readFileSync(partials[i]);
	        var name = path.basename(partials[i], ext);
	        
            var pattern = this.patternFile(file);
		    if ( pattern.attributes.pattern && (pattern.attributes.pattern.name != '') ) {
		        this.data[pattern.attributes.pattern.name] = pattern.attributes;
		        this.data[pattern.attributes.pattern.name].body = pattern.body;
	        }
		    
	    }

	}
	
	/**
	 * render a pattern with Handlebars/Panini
	 * 
	 * @param string body
	 * @param object data
	 * @return Buffer
	 */
	renderPattern ( filecontent, data ) { 
		
	    // Get the HTML for the current page and layout
	    var page = fm(filecontent);
	    var patternData = {};

	    // Determine which layout to use
	    var layout =
	        page.attributes.layout ||
	        this.options.layout;
	    var layoutTemplate = this.Panini.layouts[layout];

	    if (!layoutTemplate) {
	        if (layout === 'default') {
	            throw new Error('Patternlibrary error: you must have a layout named "default".');
	        }
	        else {
	            throw new Error('Patternlibrary error: no layout named "'+layout+'" exists.');
	        }
	    }

		data.Patternlibrary = null ;
	    // Add this page's front matter
	    patternData = extend(patternData, page.attributes);
	    patternData = extend(patternData, data);

	    // Finish by adding constants
	    patternData = extend(patternData, {
	        layout: layout
	    });
	    
	    // parameters and defaults
	    patternData = this.processPatternValues(patternData);
	    
	    // Now create Handlebars templates out of them
	    var pageTemplate = this.Handlebars.compile(page.body + '\n');
	    	    
	    // Finally, add the page as a partial called "body", and render the layout template
	    this.Handlebars.registerPartial('body', pageTemplate);
	    
	    patternData.Patternlibrary = this;
	    
	    return ( layoutTemplate(patternData) );
	    
	}
	
	/**
	 * 
	 */
	processPatternValues ( data ) { 
		
	    // determine default values
		for (var key in data.defaults) {
			if (!data[key]) {
				data[key] = data.defaults[key];
			}
		}
		
	    var patternParams = {};
	    for (var key in data.params) {
	    	
	    }
	    
	    return (data);
	}
	
	/**
	 * 
	 */
	patternUsage ( patternname, consumer ) { 

		if ( typeof this.data[patternname] != 'undefined') {
			if ( typeof this.data[patternname].usage == 'undefined') {
				this.data[patternname].usage = {
					count: 0,
					consumers: {}
				};
				
				// increase counter
				this.data[patternname].usage.count = this.data[patternname].usage.count + 1;
				
				// add consumer, increase consumer counter
				var consumerName = consumer.pattern.name;
				if (!this.data[patternname].usage.consumers[consumerName]) {
					this.data[patternname].usage.consumers[consumerName] = 1;
				} else {
					this.data[patternname].usage.consumers[consumerName] = 
						this.data[patternname].usage.consumers[consumerName] + 1;
				}
			}	
		}
		
	}
	
	/**
	 * 
	 */
	refresh ( ) { 
		
		
	}
	
	/**
	 * 'gulp-connect'/'gulp-browser-sync' middleware hook
	 */
	middleware (req, res, next) {

        var $PL = this;
        
	    switch (req.method.toLowerCase()) {
	    
	        case 'post' :
		    	
		        switch (req.url.toLowerCase()) {
		            default:
		            	next();
		        	break;
		        }
		        
		    break;

		    case 'get' :
		    default :
		    	
		        switch (req.url.toLowerCase()) {
		            case '/patternlibrary.json' :
		                res.write( JSON.stringify($PL.data) );
		                res.end();
		        	break;
		        	
		        	default:
		            	next();
		        	break;
		        }
		    
	        break;
		}
	    
    }
	
	/**
	 * gulp file-stream hook
	 * 
	 * @param VinylFile file
	 * @param string enc
	 * @param function cb
	 */
	processGulpFileStream ( file, enc, cb ) { }
	
	/**
	 * retrieve current pattern-library data
	 */
	getPatterns ( ) { return this.data; }
	
	
	//
	// helpers
	//
	
	/**
	 * recursivly read a list of files from a given directory 
	 * according to a given file-path pattern
	 * 
	 * scans relative to project root
	 * 
	 * @param string|[string] dir
	 * @param string pattern
	 * @return [string]  
	 */
	_readdir ( dir, pattern ) {
		
	    var files = [];

	    dir = !Array.isArray(dir) ? [dir] : dir;

	    for (var i in dir) {
	        files = files.concat(
	        	glob.sync( path.join( process.cwd(), dir[i], pattern ) )
	        );
	    }

	    return files;
	    
	}
	
	/**
	 * initialize 'Panini' object
	 */
	_initPanini ( ) {
		
	    if (!this.Panini) {
	    	this.Panini = new Panini.Panini(this.options.panini);
	    	this.Panini.loadBuiltinHelpers();
	        this.Panini.refresh();
	        //module.exports.refresh = this.Panini.refresh.bind(this.Panini);
	    }
	}
	
	_processRoot ( page, root ) {
		var pagePath = path.dirname(page);
		var rootPath = path.join(process.cwd(), root);

		var relativePath = path.relative(pagePath, rootPath);

		if (relativePath.length > 0) {
		    relativePath += '/';
		}

		// On Windows, paths are separated with a "\"
		// However, web browsers use "/" no matter the platform
		return slash(relativePath);
	}
}

/**
 * 'export'/bind gulp file-stream hook
 */
Patternlibrary.prototype.processGulpFileStream = require('./class.patternlibrary.process.js');

/**
 * pattern-library default options
 */
Patternlibrary.prototype.defaults = {
	layout: 'patternlibrary',      // layout-file, ex.: 'layouts/patternlibrary.html'
	page  : 'patternlibrary',      // pagebody-file ex.: 'pages/patternlibrary.html'
	dest  : 'pl/',                 // destination for resulting files
	dirs  : {                      // pattern sub-dirs
		atoms     : 'atoms/',
		molecules : 'molecules/',
		organisms : 'organisms/',
		templates : 'tempates/'
	},
    verbose: false                 // verbose console output
};

/**
 * export pattern-library object
 */
module.exports = Patternlibrary;