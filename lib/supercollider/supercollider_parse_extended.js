var async       = require('async');
var extend      = require('util')._extend;
var format      = require('string-template');
var frontMatter = require('front-matter');
var fs          = require('fs');
var glob        = require('glob');
var globAll     = require('glob-all');
var marked      = require('marked');
var path        = require('path');

// Parses files according to the options passed to the constructor.
module.exports = function(file, opts, cb) {
    var _this = this; // this => Supercollider ref, this.$PL => Patternlibrary ref
    var page = {};
    var pageData = frontMatter(file.contents.toString());
    var relativePatternPath = path.relative( _this.$PL.Config.get('partials'),  path.dirname(file.path) );
    
    if (typeof(opts) === 'function') {
        cb = opts;
        opts = {};
    }
    // Global attributes
    page = pageData.attributes;
    page.__fm = extend({}, pageData.attributes);
    page.docs = '';
    page.fileName = path.relative(process.cwd(), file.path);
    page._adapterData = {};
    page.relatedFiles = [];

    // Catch Markdown errors
    if (this.options.marked) {
        try {
            page.docs = marked(pageData.body, { renderer: _this.options.marked });
        }
        catch (e) {
            //console.log('error: ', e);
            throw new Error('Marked error: ' + e.message);
        }
    }
    else {
        page.docs = pageData.body;
    }
    
    // check for other (mandatory) page.{doctype} 
    if (!page.source)    { page.source    = path.join(  relativePatternPath, /*path.dirname(page.fileName),*/ './index.html'); }
    if (!page.example)   { page.example   = path.join(  relativePatternPath, /*path.dirname(page.fileName),*/ './index.html'); }
    if (!page.specs)     { page.specs     = path.join(  relativePatternPath, /*path.dirname(page.fileName),*/ './index.html'); }
    if (!page.changelog) { page.changelog = path.join(  relativePatternPath, /*path.dirname(page.fileName),*/ './changelog.md'); }
    if (!page.tests)     { page.tests     = path.join(  relativePatternPath, /*path.dirname(page.fileName),*/ './test.js'); }
    if (!page.gitinfo)   { page.gitinfo   = path.join(  relativePatternPath, /*path.dirname(page.fileName),*/ ''); }

    // Run each adapter's parser, if the page references it
    var parseTasks = {};
    for (var lib in this.adapters) {
        if (page[lib]) {
        
            // Placed inside an IIFE so the value of lib is correct for each function call
            (function(lib) {
                var collider = {
                    "$PL"      : _this.$PL,
                    "filePath" : path.dirname(page.fileName), //path.relative( _this.$PL.Config.get('partials'),  path.dirname(file.path) ),
                    "pattern"  : pageData.title
                };
          
                parseTasks[lib] = function(cb) {
                    // Store the original value of the YML property so it can be accessed later if needed
                    page._adapterData[lib] = page[lib];
  
                    // find correct path for 'page[lib]'...
                    var adapterFiles = findPath( page[lib], collider );
                    // Then find the configuration for the adapter...
                    var config = extend(_this.adapters[lib].config, _this.options.config[lib] || {
                        
                    });
                    config.$PL = _this.$PL;
                    // ... and run it
                    _this.adapters[lib](adapterFiles, config, cb, _this);
                };
        
                parseTasks[lib + '-files'] = function(cb) {
                    addFiles(page.relatedFiles, page[lib], collider, function(files) {
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

        // For complete builds, push all pages to the tree
        if (!opts.incremental) {
            _this.tree.push(page);
        }
        // For incremental builds, we have to figure out if the page already exists in the tree or not
        else {
            // Look for a page in the tree with a matching filename
            var key = findByKey(_this.tree, 'fileName', page.fileName);

            // If that page exists, we replace the existing page with the revised one
            if (key > -1) {
                _this.tree[key] = page;
            }
            // Otherwise, we add the new page to the end of the tree
            else {
                _this.tree.push(page);
            }
        }
 

        // debug te main data tree: _this.$PL.debug('tree: ', _this.tree);
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
 * @param   collider   Supercollider instance
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
    
    // look in "partials"/"patterns" for "type/name/file"
    if ( (fileGlobs != 'index.html') && fs.existsSync( path.join(collider.$PL.Config.get('partials'), fileGlobs) ) ) {
        return ( path.join(collider.$PL.Config.get('partials'), fileGlobs) );
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
 * @param   collider   Supercollider instance
 * @param   cb         async callback
 */
function addFiles(files, fileGlobs, collider, cb) {
    var searchGlob = fileGlobs;
    globAll(searchGlob, function(err, newFiles) {
       cb(files.concat(newFiles));
    });
}
