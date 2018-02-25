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
 * Patternlibrary Documentaion Parser
 * 
 * @package Patternlibrary
 * @namespace Patternlibrary
 * @author Björn Bartels <coding@bjoernbartels.earth>
 */
class Patternlibrary_DocParser {
    
    /**
     * Initializes an instance of Patternlibrary Documentaion Parser
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
    parsePatternPartials ( dir ) {

        var searchPath = this.$PL.Config.get('patternsearchpath');
        var filenamePattern = this.$PL.Config.get('patternfilenames').main;
        
        var partials = this._readdir(dir, path.join(searchPath, filenamePattern));
        //console.log('patterns:', patterns);

        for (var i in partials) {

            var ext  = path.extname(partials[i]);
            var file = fs.readFileSync(partials[i]);
            var name = path.basename(partials[i], ext);
            
            var pattern = this.patternFile(file);
            if ( pattern.attributes.pattern && (pattern.attributes.pattern.name != '') ) {
                this.$PL.Handlebars.registerPartial(pattern.attributes.pattern.name, pattern.body + '\n');
            }
            
        }

    }
    
    /**
     * register path-based partial names to 'handlebars'
     * 
     * @param string dir
     */
    loadPartials ( dir ) {

        var searchPath = this.$PL.Config.get('patternsearchpath');
        var filenamePattern = '*.*'; // this.$PL.Config.get('patternfilenames').main;
        
        var partials = this._readdir(dir, path.join(searchPath, filenamePattern), true);

        for (var i in partials) {

            var ext  = path.extname(partials[i]);
            var file = fs.readFileSync(partials[i]);
            var name = path.basename(partials[i], ext);
            
            var pattern = this.patternFile(file);
            if ( (pattern) ) {
            	if (typeof this.$PL.Handlebars.partials[name] != 'undefined') {
                    this.$PL.Handlebars.unregisterPartial(name);
            	}
                this.$PL.Handlebars.registerPartial(name, pattern.body + '\n');
            }
            
        }

    }
    
    /**
     * register pattern data from file info
     * 
     * @param string dir
     */
    parsePatternData ( dir ) {

        var searchPath = this.$PL.Config.get('patternsearchpath');
        var filenamePattern = this.$PL.Config.get('patternfilenames').main;
        
        var partials = this._readdir(dir, path.join(searchPath, filenamePattern));

        for (var i in partials) {

            var ext  = path.extname(partials[i]);
            var file = fs.readFileSync(partials[i]);
            var name = path.basename(partials[i], ext);
            
            var pattern = this.patternFile(file);
            if ( pattern.attributes.pattern && (pattern.attributes.pattern.name != '') ) {
                if (pattern.attributes.pattern && !pattern.attributes.pattern.type) {
                	// 'type' is not set, try to get it from 'name'
                	var parts = String(pattern.attributes.pattern.name).split('/');
                	if (parts.length > 1) {
                		pattern.attributes.pattern.type = String(parts[0])
                		   .replace('atoms', 'atom')
                		   .replace('molecules', 'molecule')
                		   .replace('organisms', 'organism')
                		;
                	}
                }
                this.$PL.data[pattern.attributes.pattern.name] = pattern.attributes;
                this.$PL.data[pattern.attributes.pattern.name].body = pattern.body;
            }
            
        }

    }
    
    /**
     * refresh/reload pattern-library data
     */
    parse ( ) { 

        this.$PL.log('refresh/reload pattern-library data');
        
        var partialsPath = (this.$PL.Config.get('partials') || 'partials');
        // gather partials
        this.parsePatternPartials(partialsPath);
        // gather pattern-library meta data
        this.parsePatternData(partialsPath);
        
        
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


Patternlibrary_DocParser.prototype.defaults = require('./../config/default.js');

module.exports = Patternlibrary_DocParser;