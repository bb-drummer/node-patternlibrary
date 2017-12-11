var extend        = require('deep-extend');
var curl          = require('curl'); // 0.1.4
var queryString   = require('query-string'); // 4.3.4
var fm            = require('front-matter');
var fs            = require('fs-extra');
var glob          = require('glob');
var path          = require('path');
var chalk         = require('chalk');
var through       = require('through2');
var slash         = require('slash');
var jsonfile      = require('jsonfile');
var marked        = require('marked');
var format        = require('string-template');
var hljs          = require('highlight.js');
var multiline     = require('multiline');

/**
 * Patternlibrary Layoutbuilder module
 * 
 * @package Patternlibrary
 * @namespace Patternlibrary
 * @author Björn Bartels <me@bjoernbartels.earth>
 */
class Patternlibrary_Layoutbuilder {
    
    /**
     * Initializes an instance of Patternlibrary Layoutbuilder module
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
    _readdir ( dir, pattern, relative = false ) {
        
        var files = [];

        dir = !Array.isArray(dir) ? [dir] : dir;

        for (var i in dir) {
            files = files.concat(
                (!relative) ?
                    glob.sync( path.join( process.cwd(), dir[i], pattern ) ) :
                        glob.sync( path.join( dir[i], pattern ) )
            );
        }

        return files;
        
    }
    
    /**
     * determine the relative path between 2 given paths
     * 
     * @param string page
     * @param string root
     * @return string
     */
    _relativeRoot ( page, root ) {
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


Patternlibrary_Layoutbuilder.prototype.defaults = require('./../config/default.js');

module.exports = Patternlibrary_Layoutbuilder;