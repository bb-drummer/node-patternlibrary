var fm      = require('front-matter');
var path    = require('path');
var through = require('through2');
var extend  = require('deep-extend');

/**
 * bind gulp file-stream hook
 */
module.exports = function() {
  return through.obj(patternlibrary_process_file_stream.bind(this));
}

/**
 * gulp file-stream hook
 * 
 * @param VinylFile file
 * @param string enc
 * @param function cb
 */
function patternlibrary_process_file_stream ( file, enc, cb ) {
	
	var file;
	
    try {
 
	    if (!!this.options.verbose) console.log('process file: ', file.path);

	    if (!file.stat.isDirectory()) {
	    	
		    //
            // ... have pattern-file here? -> perform panini/hbs stuff from here to compile the PL pages...
		    //
			
		    // Get the HTML for the current page and layout
		    var patternFile = file.contents.toString();
		    var patternData = {};
		    
		    // Build page data with globals
		    extend(patternData, this.Panini.data);

		    // Add any data from stream plugins
		    (file.data) ? extend(patternData, file.data) : patternData = patternData;

		    // Finish by adding constants
		    extend(patternData, {
		        page: path.basename(file.path, '.html'),
		        root: this._relativeRoot(file.path, this.Panini.options.root)
		    });

		    this.patternUsage(patternData.page);
		    this.updateDataFile();
		    
		    patternData.Patternlibrary = this;
            var renderedPage = this.renderPattern(patternFile, patternData);
		    file.contents = new Buffer( renderedPage );
		    
        }
	    
    } catch (e) {
        if (typeof layoutTemplate != 'undefined') {
            // Layout was parsed properly so we can insert the error message into the body of the layout
            this.Handlebars.registerPartial('body', 'Patternlibrary: template could not be parsed <br> \n <pre>{{error}}</pre>');
            file.contents = new Buffer(layoutTemplate({ error: e }));
        }
        else {
            // Not even once - write error directly into the HTML output so the user gets an error
            // Maintain basic html structure to allow Livereloading scripts to be injected properly
            file.contents = new Buffer('<!DOCTYPE html><html><head><title>Patternlibrary error</title></head><body><pre>'+e+'</pre></body></html>');
        }

        // Log the error into console
        console.log('Patternlibrary: rendering error ocurred.\n', e);
        
    } finally {
    	
        // This sends the modified file back into the stream
        cb(null, file);
        
    }
}