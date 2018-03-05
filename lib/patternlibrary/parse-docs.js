/**
 * Parses for pattern's documentation
 * 
 * 
 * @package Patternlibrary
 */
var async       = require('async');
var extend      = require('util')._extend;
var format      = require('string-template');
var fm          = require('front-matter');
var fs          = require('fs');
var glob        = require('glob');
var globAll     = require('glob-all');
var path        = require('path');
var chalk       = require('chalk');
var extend      = require('extend');
var sanatizeType = require('../util/sanatize-patterntype');

module.exports = function(file, opts, cb) {
    var _this = this; // this => Supercollider ref, this.$PL => Patternlibrary ref
    var page = {};
    var pageData = fm(file.contents.toString());
    var relativePatternPath = path.relative( this.options.partials,  path.dirname(file.path) );
    
    if (typeof(opts) === 'function') {
        cb = opts;
        opts = {};
    }
    // Global attributes
    page = pageData.attributes;
    //page.__fm = pageData.attributes;
    page.docs = '';
    page.fileName = path.relative(process.cwd(), file.path);
    page._adapterData = {};
    page._adapterFiles = {};
    page.relatedFiles = [];

    // Catch Markdown errors
    if (this.markdown) {
        try {
            page.docs = this.markdown.render(pageData.body);
        }
        catch (e) {
            throw new Error('Markdown error: ' + e.message);
        }
    }
    else {
        page.docs = pageData.body;
    }

    // check for other (mandatory) page.{doctype} 
    if (!page.source)    { 
    	page.source = path.join(relativePatternPath, './index.html');
    } else {
    	page.source = path.join(relativePatternPath, page.source);
    }
    if (!page.sourcecode) { page.sourcecode = page.source; }
    if (!page.example)    { page.example    = page.source; }
    if (!page.specs)      { page.specs      = page.source; }
    if (!page.changelog)  { page.changelog  = path.join(  relativePatternPath, './changelog.md'); }
    if (!page.tests)      { page.tests      = path.join(  relativePatternPath, './test.js'); }
    if (!page.gitinfo)    { page.gitinfo    = path.join(  relativePatternPath, ''); }

    // Run each adapter's parser, if the page references it
    var parseTasks = {};
    for (var lib in this.adapters) {
        if (page[lib]) {
        
            // Placed inside an IIFE so the value of lib is correct for each function call
            (function(lib) {
                var collider = {
                    "options"  : _this.options,
                    "filePath" : path.dirname(page.fileName), //path.relative( _this.$PL.Config.get('partials'),  path.dirname(file.path) ),
                    "pattern"  : pageData.title
                };
          
                parseTasks[lib] = function(cb) {
                    // Store the original value of the YML property so it can be accessed later if needed
                    page._adapterData[lib] = page[lib];
  
                    // find correct path for 'page[lib]'...
                    var adapterFiles = findPath( page[lib], collider );
                    page._adapterFiles[lib] = adapterFiles;
                    
                    // Then find the configuration for the adapter...
                    var config = extend(_this.adapters[lib].config, _this.options.adapters[lib] || {
                        
                    });

                    // ... and run it
                    _this.adapters[lib](adapterFiles, config, cb, _this);
                };
        
                parseTasks[lib + '-files'] = function(cb) {
                    addFiles(page.relatedFiles, page._adapterFiles[lib], function(files) {
                        page.relatedFiles = files;
                        cb();
                    });
                };
        
            })(lib);
      
        }
    } // for(adapters)

    async.parallel(parseTasks, function(err, results) {
        for (var i in results) {
            page[i] = results[i];
        }

        var patternname = sanatizeType(path.dirname(page.source));
        _this.data.patterns[patternname] = extend(_this.data.patterns[patternname], page);
        //_this.updateDataFile();
        _this.log.info('parse tasks finished for "'+chalk.green(patternname)+'"');

        // debug the main data tree: _this.$PL.debug('tree: ', _this.data);
        cb(null, page);
    });
}

/**
 * find array item-key by object-key value in an array of objects
 * 
 * @param array
 * @param key
 * @param value
 * @returns integer >= 0 on success, -1 on failure
 */
function findByKey(array, key, value) {
    for (var i in array) {
        if (array[i][key] && array[i][key] === value) {
            return i;
        }
    }
    return -1;
}

/**
 * find 'correct' path for '(related)File' globs
 * 
 * @param   fileGlobs  fileGlobs to look for
 * @param   collider   config
 * @returns fileGlob
 */
function findPath(fileGlobs, collider) {
    
    // look in "partials"/"patterns"' filepath for "file"
    if ( fs.existsSync( path.join(collider.filePath, fileGlobs) ) ) {
        return ( path.join(collider.filePath, fileGlobs) );
    }
    // look in "partials"/"patterns"' filepath for "*/**/file"
    if ( fs.existsSync( path.join(collider.filePath, "*/**/", fileGlobs) ) ) {
        return ( path.join(collider.filePath, "*/**/", fileGlobs) );
    }
    
    // look in "partials"/"patterns" for "type/name/file" --- (fileGlobs != 'index.html') && 
    if ( fs.existsSync( path.join(collider.options.partials, fileGlobs) ) ) {
        return ( path.join(collider.options.partials, fileGlobs) );
    }
    
    // org. file path
    if (fs.existsSync( fileGlobs ) ) {
        return ( fileGlobs );
    }
    
    // if all fail, return given globs
    return(fileGlobs)
}

/**
 * add related files to task
 * 
 * @param   files      related files
 * @param   fileGlobs  files to look for
 * @param   cb         async callback
 */
function addFiles(files, fileGlobs, cb) {
    var searchGlob = fileGlobs;
    globAll(searchGlob, function(err, newFiles) {
       cb(files.concat(newFiles));
    });
}
