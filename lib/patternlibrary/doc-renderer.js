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
 * Patternlibrary (page,template,doc) renderer
 * 
 * @package Patternlibrary
 * @namespace Patternlibrary
 * @author Björn Bartels <me@bjoernbartels.earth>
 */
class Patternlibrary_DocRenderer {
    
    /**
     * Initializes an instance of Patternlibrary (pattern) renderer.
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
    //
    // Basic Rendering Methods
    //
    //
    
    
    /**
     * render a template-file or template string
     * 
     * @param VinylFile|string template_file
     * @param Buffer layoutTemplate
     * @param object user_data
     * @return VinylFile|string
     */
    renderPage ( page_file, layoutTemplate, user_data ) {
        
        var result = '';
        
        try {

            var patternFile = (typeof page_file != 'string') ? page_file.contents.toString() : page_file;
            var patternData = this.$PL.Panini.data; // {};
            
            // Build page data with globals
            //this.$PL.Panini.data.Patternlibrary = null;
            //extend(patternData, this.$PL.Panini.data);
            
            if (typeof page_file == 'string') {
                // Finish by adding constants
                extend(patternData, {
                    page            : "string",
                    basepath        : this.$PL.Config.get('basepath'),
                    root            : this.$PL.Config.get('basepath'),
                    patternrootpath : path.join(this.$PL.Config.get('basepath'), '/patterns')
                });
            }
            
            if (page_file.stat && page_file.stat.isFile()) {

                // Add any data from stream plugins
                (page_file.data) ? extend(patternData, page_file.data) : patternData = patternData;

                // Finish by adding constants
                extend(patternData, {
                    page            : path.basename(page_file.path, '.html'),
                    basepath        : this.$PL.Config.get('basepath'),
                    root            : this._relativeRoot(file.path, this.$PL.Panini.options.root),
                    patternrootpath : this._relativeRoot(file.path, this.$PL.Panini.options.partials)
                });
                
            }
            
            if (user_data) extend(patternData, user_data);

            this.$PL.patternUsage(patternData.page);
            this.$PL.updateDataFile();

            patternData.Patternlibrary = this.$PL;

            // Now create Handlebars templates out of them
            var pageTemplate = this.$PL.Handlebars.compile(patternFile /*+ '\n'*/, {noEscape: true});
                    
            // Finally, add the page as a partial called "body", and render the layout template
            this.$PL.Handlebars.registerPartial('body', pageTemplate);
            
            // Compile Page with Data
            var renderedPage = ( layoutTemplate(patternData) );
            
            if (typeof page_file == 'string') {
                result = renderedPage;
            }
            if (page_file.stat && page_file.stat.isFile()) {
                page_file.contents = new Buffer( renderedPage );
            }
            
        } catch (e) {
            if (typeof layoutTemplate != 'undefined') {
                // Layout was parsed properly so we can insert the error message into the body of the layout
                this.$PL.Handlebars.registerPartial('body', 'Patternlibrary: template could not be parsed <br> \n <pre>{{error}}</pre>');
                if (typeof page_file == 'string') {
                    result = layoutTemplate({ error: e });
                }
                if (page_file.stat && page_file.stat.isFile()) {
                    page_file.contents = new Buffer( layoutTemplate({ error: e }) );
                }
            }
            else {
                // Not even once - write error directly into the HTML output so the user gets an error
                // Maintain basic html structure to allow Livereloading scripts to be injected properly
                file.contents = new Buffer('<!DOCTYPE html><html><head><title>Patternlibrary error</title></head><body><pre>'+e+'</pre></body></html>');
            }

            // Log the error into console
            this.$PL.warn('rendering error ocurred: ', e);
            this.$PL.debug('rendering error ocurred: ', e);
            
        } finally {
            
            // This sends the modified file back into the stream
          
            
        }
        
        if (page_file.stat && page_file.stat.isFile()) {
            return page_file;
        } 
        return result;

    } // renderPage () {}
    
    
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
            this.$PL.options.templates.layout;
        var layoutTemplate = this.$PL.Panini.layouts[layout];
        // alternatively, prepare an 'empty' layout' : var layoutTemplate = this.$PL.Handlebars.compile('{{> body}}' /*+ '\n'*/, {noEscape: true});

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
        patternData = this._processPatternParameterValues(patternData);

        patternData.Patternlibrary = this.$PL;
        // Now create Handlebars templates out of them
        var pageTemplate = this.$PL.Handlebars.compile(page.body /*+ '\n'*/, {noEscape: true});
                
        // Finally, add the page as a partial called "body", and render the layout template
        this.$PL.Handlebars.registerPartial('body', pageTemplate);
        
        
        return ( layoutTemplate(patternData) );
        
    } // renderPattern () {}
    
    
    /**
     * process (missing) pattern-template defaults and parameters
     * 
     * @param object data
     * @return object
     */
    _processPatternParameterValues ( data ) { 
        
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
    } // renderPattern () {}
    
    
    /**
     * loads and prepares a layout file
     * 
     * @param string filename
     * @return Buffer
     */
    _getLayoutFromFile ( filename ) {
        var ext    = path.extname(filename);
        var name   = path.basename(filename, ext);
        var file   = fs.readFileSync(filename);
        
        var layout = this.$PL.Handlebars.compile(file.toString(), {noEscape: true});
        return (layout);
    } 
    
    
    /**
     * render a markdown snippet into HTML
     * 
     * @param string body
     * @return string
     */
    renderMarkdown ( body ) { 
        return  marked( body, { renderer: require('../vendor/marked')(this)} );
    } // renderMarkdown () {}
    
    

    /**
     * render a code snippet into highlighted code HTML
     * 
     * @param string language
     * @param string code
     * @return string
     */
    highlightCode ( language, code ) { 
        return  hljs.highlight( language, code ).value;
    } // highlightCode () {}
    
    

    //
    //
    // Generate Documentation Pages
    //
    //
    
    
    /**
     * render pattern main documentation file
     * 
     * @return self
     */
    renderDocumentation ( template, targetfilename, callback ) {

        this.$PL.log('start parsing patterns documentation (\'Supercollider\' background process)');

        if (!this.$PL.Supercollider) {
            return
        }

        var time = process.hrtime();
        
        var $this    = this;
        var patterns = this.$PL.getPatterns();

        var searchPath = this.$PL.Config.get('patternsearchpath');
        var filenamePattern = this.$PL.Config.get('patternfilenames').readme;
        
        var destinationPath = this.$PL.Config.get('dest') + '/patterns';
        
        var templateData = this.$PL.Panini.data;
        
        templateData.root = this.$PL.Config.get('basepath');
        templateData.basepath = this.$PL.Config.get('basepath');
        
        this.$PL.Supercollider.config({
            silent         : !this.$PL.Config.get('verbose'),
            handlebars     : this.$PL.Handlebars,
            data           : templateData,
            marked         : require('./../vendor/marked')(this.$PL),
            src            : [ this.options.partials + path.join(searchPath, filenamePattern) ] , /*this.options.pages + '/*.md',*/ 
            dest           : destinationPath,
            template       : template,
            targetfilename : targetfilename,
            Patternlibrary : this.$PL
        });
        let stream = this.$PL.Supercollider.init({
            incremental : true
        });
        stream.on('finish', function() {
            var diff = (process.hrtime(time)[1] / 100000000/*0*/).toFixed(2);
            $this.$PL.log('finish parsing patterns documentation '+(chalk.magenta(targetfilename))+' ('+(chalk.magenta(diff + ' s'))+')');
            
            $this.$PL.updateDataFile();
            
            if (typeof callback == 'function') {
                callback.apply($this);
            }
            
        });
        
        return (this);
        
    } // renderDocumentation
    

    /**
     * render pattern main documentation file
     * 
     * @return self
     */
    renderIndexDocumentation ( ) {
        var $this = this;
        return $this.renderDocumentation(
            __dirname + '/../../' + 'gui/src/pages/template-supercollider.html',
            'index.html',
            $this.renderReadmeDocumentation
        );
    }
    
    /**
     * render pattern ReadMe documentation file
     * 
     * @return self
     */
    renderReadmeDocumentation ( ) {
        var $this = this;
        return $this.renderDocumentation(
            __dirname + '/../../' + 'gui/src/partials/docs/sections/docs-section-readme.html',
            'readme.html',
            $this.renderScssDocumentation
        );
    }
    
    /**
     * render pattern SCSS documentation file
     * 
     * @return self
     */
    renderScssDocumentation ( ) {
        var $this = this;
        return $this.renderDocumentation(
                __dirname + '/../../' + 'gui/src/partials/docs/sections/docs-section-scss.html',
            'scss.html',
            $this.renderJavascriptDocumentation
        );
    }
    
    /**
     * render pattern JS documentation file
     * 
     * @return self
     */
    renderJavascriptDocumentation ( ) {
        var $this = this;
        return $this.renderDocumentation(
                __dirname + '/../../' + 'gui/src/partials/docs/sections/docs-section-javascript.html',
            'javascript.html',
            $this.renderMarkupDocumentation
        );
    }
    
    /**
     * render pattern markup documentation file
     * 
     * @return self
     */
    renderMarkupDocumentation ( ) {
        var $this = this;
        return $this.renderDocumentation(
                __dirname + '/../../' + 'gui/src/partials/docs/sections/docs-section-markup.html',
            'markup.html',
            $this.renderSpecsDocumentation
        );
    }
    
    /**
     * render pattern template documentation file
     * 
     * @return self
     */
    renderSpecsDocumentation ( ) {
        var $this = this;
        return $this.renderDocumentation(
                __dirname + '/../../' + 'gui/src/partials/docs/sections/docs-section-specs.html',
            'template.html',
            $this.renderChangelogDocumentation
        );
    }
    
    /**
     * render pattern change-log documentation file
     * 
     * @return self
     */
    renderChangelogDocumentation ( ) {
        var $this = this;
        return $this.renderDocumentation(
                __dirname + '/../../' + 'gui/src/partials/docs/sections/docs-section-changelog.html',
            'changelog.html'
        );
    }
    
    //
    //
    // Generate Index (list) pages
    //
    //
    
    /**
     * render pattern(list) index files
     * 
     * @return self
     */
    renderPatternlistIndexPages( ) {
        
        this.$PL.log('render pattern(list) index files');

        var destinationPath = this.$PL.Config.get('dest') + '/patterns';
        var patterns        = this.$PL.Config.get('patterns');
        var filenamePattern = this.$PL.Config.get('patternfilenames').main;
        var basedir         = path.join(__dirname + '/../../' + 'gui/src/pages/pl/');
        
        var indexPages = this._readdir(
            [ path.join(basedir, './*/**/'),  path.join(basedir) ],
            'index.html',
            true
        );
        var layout     = this._getLayoutFromFile( path.join(__dirname + '/../../' + 'gui/src/layouts/patternpage.html') );
        
        for (var i in indexPages) {
            var pageFile = fs.readFileSync(indexPages[i]);
            
            
            var patternlist = null;
            if ( indexPages[i].indexOf('atom') != -1 ) {
                patternlist = this.$PL.getPatterns('atom');
            } else if ( indexPages[i].indexOf('molecule') != -1 ) {
                patternlist = this.$PL.getPatterns('molecule');
            } else if ( indexPages[i].indexOf('organism') != -1 ) {
                patternlist = this.$PL.getPatterns('organism');
            } else if ( indexPages[i].indexOf('template') != -1 ) {
                patternlist = this.$PL.getPatterns('template');
            } else {
                patternlist = this.$PL.getPatterns();
            }
            if (patternlist) {
                this.$PL.Panini.data.patternlist = patternlist;
            }

            
            var rendered = this.renderPage(pageFile.toString(), layout);
            
            var patternFile = indexPages[i].replace(basedir, '');
            var targetFile = path.join(destinationPath, patternFile);

            fs.ensureFileSync(targetFile);
            var pageFile = fs.writeFileSync(targetFile, rendered);

        }
        
    } // renderDocumentation
    
    
    
    
    /**
     * render documentation
     */
    renderDocs ( ) { 
        
        // load extra GUI partials
        this.$PL.getDocParser().loadPartials( path.join(__dirname + '/../../' + 'gui/src/partials/') ); // /*/**/*.html');
        
        
        // render main pattern doc
        this.renderIndexDocumentation();
        
        
        // render pattern-list pages
        this.renderPatternlistIndexPages();
        
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


Patternlibrary_DocRenderer.prototype.defaults = require('./../config/default.js');

module.exports = Patternlibrary_DocRenderer;