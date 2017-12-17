var extend        = require('deep-extend');
var curl          = require('curl'); // 0.1.4
var queryString   = require('query-string'); // 4.3.4
var fm            = require('front-matter');
var fs            = require('fs-extra');
var glob          = require('glob');
var path          = require('path');
var through       = require('through2');
var slash         = require('slash');
var jsonfile      = require('jsonfile');

/**
 * Patternlibrary 'vinyl'/'gulp' file-stream hook
 * 
 * @package Patternlibrary
 * @namespace Patternlibrary
 * @author Björn Bartels <me@bjoernbartels.earth>
 */
class Patternlibrary_Filestream {
    
    /**
     * Initializes an instance of Patternlibrary file-stream hook.
     * @constructor
     * @param {object} options - Configuration options to use.
     * @param {Patternlibrary} patternlibrary - main patternlibrary object reference.
     */
    constructor ( options, patternlibrary ) {
        
        this.options = extend(this.defaults, options);
        this.$PL     = null;
        
        if (typeof patternlibrary == 'object') {
            this.$PL = patternlibrary;
        }
    }
    
    /**
     * bind Patternlibrary object
     * 
     * @param Patternlibrary the Patternlibrary
     * @return self
     */
    bind ( patternlibrary ) {
        if ( (typeof patternlibrary.patternlibrary_version == 'undefined') ) throw 'invalid patternlibrary object to bind';
        
        if (typeof patternlibrary == 'object') {
            this.$PL = patternlibrary;
        }
        
        return (this);
    }
    
    /**
     * vinyl/gulp file-stream hook
     * 
     * @param VinylFile file
     * @param string enc
     * @param function cb
     */
    stream ( ) {
        return through.obj( this.process.bind(this.$PL) );
    }
    
    /**
     * vinyl/gulp file-stream hook
     * 
     * @param VinylFile file
     * @param string enc
     * @param function cb
     */
    process ( file, enc, cb ) {
        
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
                this.Panini.data.Patternlibrary = null;
                this.Panini.data.$PL = null;
                extend(patternData, this.Panini.data);

                // Add any data from stream plugins
                if (file.data) extend(patternData, file.data);

                // Finish by adding constants
                extend(patternData, {
                    page: path.basename(file.path, '.html'),
                    root: this._relativeRoot(file.path, this.Panini.options.root)
                });

                this.patternUsage(patternData.page);
                this.updateDataFile();
                
                patternData.Patternlibrary = this;
                this.Panini.data.$PL = this;
                var renderedPage = this.getDocRenderer().renderPattern(patternFile, patternData);
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
            // ... call "cb(null, file);" instead
            cb();
            
        }

    } // process () {}
    
}


Patternlibrary_Filestream.prototype.defaults = require('./../config/default.js');

module.exports = Patternlibrary_Filestream;