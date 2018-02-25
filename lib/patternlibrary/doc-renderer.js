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
 * @author Björn Bartels <coding@bjoernbartels.earth>
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
        
        this.options.modulePath = path.dirname( path.dirname(__dirname) );
        
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
                if (page_file.data) extend(patternData, page_file.data);

                // Finish by adding constants
                extend(patternData, {
                    page            : path.basename(page_file.path, '.html'),
                    basepath        : this.$PL.Config.get('basepath'),
                    root            : this._relativeRoot(file.path, this.$PL.Panini.options.root),
                    patternrootpath : this._relativeRoot(file.path, this.$PL.Panini.options.partials)
                });
                
            }
            
            if (user_data) extend(patternData, user_data);
            patternData.categories = this.$PL.getCategories();
            this.$PL.patternUsage(patternData.page);
            this.$PL.updateDataFile();

            patternData.Patternlibrary = this.$PL;

            try {
                
                // Now create Handlebars templates out of them
                var pageTemplate = this.$PL.Handlebars.compile(patternFile /*+ '\n'*/, {noEscape: true});
                        
                // Finally, add the page as a partial called "body", and render the layout template
                this.$PL.Handlebars.registerPartial('body', pageTemplate);
                
                // Compile Page with Data
                var renderedPage = ( layoutTemplate(patternData) );

            } catch (err) {
                this.$PL.warn('Handlebars Error: ', err);
            }        
            
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
        //var layoutTemplate = this.$PL.Panini.layouts[layout];
        // alternatively, prepare an 'empty' layout' : 
        var layoutTemplate = this.$PL.Handlebars.compile('{{> body}}' /*+ '\n'*/, {noEscape: true});

        if (!layoutTemplate) {
            if (layout === 'default') {
                throw new Error('Patternlibrary error: you must have a layout named "default".');
            }
            else {
                throw new Error('Patternlibrary error: no layout named "'+layout+'" exists.');
            }
        }

        try {

            data.Patternlibrary = null ;
            if (page.attributes.pattern && !page.attributes.pattern.type) {
                // 'type' is not set, try to get it from 'name'
                var parts = String(page.attributes.pattern.name).split('/');
                if (parts.length > 1) {
                    page.attributes.pattern.type = String(parts[0])
                       .replace('atoms', 'atom')
                       .replace('molecules', 'molecule')
                       .replace('organisms', 'organism')
                    ;
                }
            }
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
            
        } catch (err) {
            this.$PL.warn('renderPattern Error: ', err);
        }        
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
        
        try {
            var layout = this.$PL.Handlebars.compile(file.toString(), {noEscape: true});
        } catch (err) {
            this.$PL.warn('_getLayoutFromFile Error: ', err);
        }        
        return (layout);
    } 
    
    
    /**
     * render a markdown snippet into HTML
     * 
     * @param string body
     * @return string
     */
    renderMarkdown ( body ) { 
        try {
            return marked( body, { renderer: require('../vendor/marked')(this.$PL)} );
        } catch (err) {
            this.$PL.warn('renderMarkdown Error: ', err);
        }        
    } // renderMarkdown () {}
    
    

    /**
     * render a code snippet into highlighted code HTML
     * 
     * @param string language
     * @param string code
     * @return string
     */
    highlightCode ( language, code ) { 
        try {
            return  hljs.highlight( language, code ).value;
        } catch (err) {
            this.$PL.warn('highlightCode Error: ', err);
        }        
    } // highlightCode () {}
    
    

    //
    //
    // Generate Documentation Pages
    //
    //
    
    
    /**
     * render pattern main documentation file
     * 
     * @param {string} template - template file path
     * @param {string} targetfilename - name of file to save to
     * @param {function} callback - callback to execute at process' end
     * @return self
     */
    renderDocumentationTemplateToFile ( template, targetfilename, callback ) {

        this.$PL.log('start rendering patterns documentation (\'Supercollider\' background process)');

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
        templateData.Patternlibrary = this.$PL;
        
        templateData.root = this.$PL.Config.get('basepath');
        templateData.basepath = this.$PL.Config.get('basepath');

        try {

            this.$PL.Supercollider.config({
                silent         : !this.$PL.Config.get('verbose'),
                handlebars     : this.$PL.Handlebars,
                data           : templateData,
                marked         : require('./../vendor/marked')(this.$PL),
                //src            : [ this.options.partials + path.join(searchPath, filenamePattern) ] , /*this.options.pages + '/*.md',*/ 
                src            : [ path.join( this.options.partials, path.join(searchPath, filenamePattern) ) ] , /*this.options.pages + '/*.md',*/ 
                dest           : destinationPath,
                template       : template,
                targetfilename : targetfilename,
                Patternlibrary : this.$PL
            });
            let stream = this.$PL.Supercollider.init({
                incremental : !true
            });
            
            stream.on('finish', function() {
                var diff = (process.hrtime(time)[1] / 100000000/*0*/).toFixed(2);
                $this.$PL.log('finish rendering patterns documentation '+(chalk.magenta(targetfilename))+' ('+(chalk.magenta(diff + ' s'))+')');
                
                $this.$PL.updateDataFile();
                
                // console.log('PATTERNLIBRARY:', $this.$PL.data ); exit();
                
                if (typeof callback == 'function') {
                    callback.apply($this);
                }
                
            });

        } catch (err) {
            this.$PL.warn('renderDocumentationTemplateToFile Error: ', err);
        }        
        return (this);
        
    } // renderDocumentationTemplateToFile
    

    /**
     * render pattern main documentation file
     * 
     * @return self
     */
    renderPatternDocumentation ( ) {
        var $this = this,
            tmplPath = this._projectPath('gui/src/pages/pl/patterndocs.html')
        ;
        return $this.renderDocumentationTemplateToFile(
            tmplPath,
            'index.html'
        );
    }
    
    
    //
    //
    // Generate Index (list) pages
    //
    //
    
    /**
     * render category(list) index files
     * 
     * @return self
     */
    renderCategoryListIndexPages( ) {
        
        this.$PL.log('render category(list) index file');

        // render categeory list
        this.renderCategoryIndexPage( );

        var categorylist = this.$PL.getCategories();
        
        for (var i in categorylist) {
            
            // render categeory pattern-list
            this.renderCategoryIndexPage( categorylist[i].slug );
            
        }
        
        return (this);
    } // renderCategoryListIndexPages
    
    /**
     * render category's (patternlist) index files
     * 
     * @param string category
     * @return self
     */
    renderCategoryIndexPage( category ) {
        
        this.$PL.log('render category\'s pattern(list) index file');

        var destinationPath = this.$PL.Config.get('dest') + '';
        var patterns        = this.$PL.Config.get('patterns');
        var filenamePattern = this.$PL.Config.get('patternfilenames').main;
        // var basedir         = path.join(__dirname + '/../../' + 'gui/src/pages/pl/');
        var basedir         = this._projectPath('gui/src/pages/pl/');
        
        if (typeof category == 'undefined') {
            var category = '';
        }
        var indexPages = this._readdir(
                [ path.join(this._projectPath('gui/src/pages/pl/categories/')) ],
                (( category != '' ) ? 'index-category.html' : 'index.html'),
                true
            );
        
        for (var i in indexPages) {

            var patternFile  = indexPages[i].replace(basedir, '').replace('index-category.html', category+'/index.html');
            var targetFile   = path.join(destinationPath, patternFile);
    
            var patternlist  = null;
            var categorylist = this.$PL.getCategories();
            if ( category != '' ) {
                patternlist  = this.$PL.getPatterns(category);
            } else {
                patternlist  = this.$PL.getPatterns();
            }
            
            if (patternlist) {
                this.$PL.Panini.data.patternlist = patternlist;
            }
            this.$PL.Panini.data.categorylist = categorylist;

            this.$PL.Panini.data.Patternlibrary = this.$PL;
            // ---
            
            var pageFile = fs.readFileSync(indexPages[i]);
            //var layout   = this._getLayoutFromFile( path.join(__dirname + '/../../' + 'gui/src/layouts/patternlibrary.html') );
            var layout   = this._getLayoutFromFile( this._projectPath('gui/src/layouts/patternlibrary.html') );
            
            var rendered = this.renderPage(pageFile.toString(), layout);
            
            fs.ensureFileSync(targetFile);
            var pageFile = fs.writeFileSync(targetFile, rendered);

            // this.renderListIndexPage( pageFile, targetFile, patternlist, categorylist);
            
        }
        
        return (this);
    } // renderCategoryIndexPage
    
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
        // var basedir         = path.join(__dirname + '/../../' + 'gui/src/pages/pl/');
        var basedir         = this._projectPath('gui/src/pages/pl/');
        
        var indexPages = this._readdir(
            [ 
                path.join(this._projectPath('gui/src/pages/pl/atoms'), './**/'),  
                path.join(this._projectPath('gui/src/pages/pl/molecules'), './**/'),  
                path.join(this._projectPath('gui/src/pages/pl/organisms'), './**/'),  
                path.join(this._projectPath('gui/src/pages/pl/templates'), './**/'),  
                path.join(basedir) 
            ],
            'index.html',
            true
        );
        
        for (var i in indexPages) {
            
            var patternFile  = indexPages[i].replace(basedir, '');
            var targetFile   = path.join(destinationPath, patternFile);
            
            var patternlist  = null;
            var categorylist = this.$PL.getCategories();
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
            this.$PL.Panini.data.categorylist = categorylist;

            this.$PL.Panini.data.Patternlibrary = this.$PL;

            // ---
            
            var pageFile = fs.readFileSync(indexPages[i]);
            //var layout   = this._getLayoutFromFile( path.join(__dirname + '/../../' + 'gui/src/layouts/patternlibrary.html') );
            var layout   = this._getLayoutFromFile( this._projectPath('gui/src/layouts/patternlibrary.html') );
            
            var rendered = this.renderPage(pageFile.toString(), layout);

            fs.ensureFileSync(targetFile);
            var pageFile = fs.writeFileSync(targetFile, rendered);

            // this.renderListIndexPage( pageFile, targetFile, patternlist, categorylist);
        }
        
        return (this);
        
    } // renderPatternlistIndexPages
    
    /**
     * render list index file
     * 
     * @param string patternFile
     * @param string targetFile
     * @param [pattern] patternlist
     * @param [category] categorylist
     * @return self
     */
    renderListIndexPage( template, targetFile, patternlist, categorylist) {
        
        this.$PL.log('render pattern(list) index file: '+chalk.cyan(targetFile));
        
        //var layout = this._getLayoutFromFile( path.join(__dirname + '/../../' + 'gui/src/layouts/patternlibrary.html') );
        var layout = this._getLayoutFromFile( this._projectPath('gui/src/layouts/patternlibrary.html') );
        this.$PL.Panini.data.patternlist  = null;
        this.$PL.Panini.data.categorylist = null;
        
        if (patternlist) {
            this.$PL.Panini.data.patternlist = patternlist;
        }
        if (categorylist) {
            this.$PL.Panini.data.categorylist = categorylist;
        }

        this.$PL.Panini.data.Patternlibrary = this.$PL;
        
        var rendered = this.renderPage(template.toString(), layout);
        
        fs.ensureFileSync(targetFile);
        var pageFile = fs.writeFileSync(targetFile, rendered);
        
        return (this);
    } // renderListIndexPage
    
    
    /**
     * render dashboard page
     * 
     * @return self
     */
    renderDashboardPage( ) {
        
        this.$PL.log('render dashboard');

        var destinationPath  = this.$PL.Config.get('dest') + '';
        var patterns         = this.$PL.Config.get('patterns');
        var filenamePattern  = this.$PL.Config.get('patternfilenames').main;
        //var basedir         = path.join(__dirname + '/../../' + 'gui/src/pages/pl/');
        var basedir          = this._projectPath('gui/src/pages/pl/');
        
        var dasboardTmplPath = path.join(basedir, 'dashboard.html');
        var targetFile       = path.join(destinationPath, 'index.html');
        
        var patternlist      = this.$PL.getPatterns();
        var categories       = this.$PL.getCategories();
        var atoms            = this.$PL.getPatterns('atom');
        var molecules        = this.$PL.getPatterns('molecule');
        var organisms        = this.$PL.getPatterns('organism');
        var templates        = this.$PL.getPatterns('template');
    
        this.$PL.Panini.data.patternlist        = patternlist;
        this.$PL.Panini.data.categorylist       = categories;
        this.$PL.Panini.data.atomlist           = atoms;
        this.$PL.Panini.data.moleculeslist      = molecules;
        this.$PL.Panini.data.organismslist      = organisms;
        this.$PL.Panini.data.templatesliste     = templates;
 
        this.$PL.Panini.data.categoriesCount    = Object.keys(categories).length;
        this.$PL.Panini.data.atomsCount         = Object.keys(atoms).length;
        this.$PL.Panini.data.moleculesCount     = Object.keys(molecules).length;
        this.$PL.Panini.data.organismsCount     = Object.keys(organisms).length;
        this.$PL.Panini.data.templatesCount     = Object.keys(templates).length;
    
        this.$PL.Panini.data.Patternlibrary     = this.$PL;
    
        // ---
        
        var pageFile = fs.readFileSync(dasboardTmplPath);
        //var layout   = this._getLayoutFromFile( path.join(__dirname + '/../../' + 'gui/src/layouts/patternlibrary.html') );
        var layout   = this._getLayoutFromFile( this._projectPath('gui/src/layouts/patternlibrary.html') );
        
        var rendered = this.renderPage(pageFile.toString(), layout);
    
        fs.ensureFileSync(targetFile);
        var pageFile = fs.writeFileSync(targetFile, rendered);
        
        return (this);
        
    } // renderDashboardPage
    
    
    /**
     * render layoutbuilder files
     * 
     * @return self
     */
    renderLayoutbuilderPages( ) {
        
        this.$PL.log('render layoutbuilder files');

        var destinationPath = this.$PL.Config.get('dest') + '';
        var patterns        = this.$PL.Config.get('patterns');
        var filenamePattern = this.$PL.Config.get('patternfilenames').main;
        //var basedir         = path.join(__dirname + '/../../' + 'gui/src/pages/pl/');
        var basedir         = this._projectPath('gui/src/pages/pl/');
        
        var indexPages = this._readdir(
            [ path.join(this._projectPath('gui/src/pages/pl/builder/'), './**/') ],
            'index.html',
            true
        );
        
        for (var i in indexPages) {
            
            var patternFile  = indexPages[i].replace(basedir, '');
            var targetFile   = path.join(destinationPath, patternFile);
            
            var patternlist  = null;
            var categorylist = this.$PL.getCategories();
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
            this.$PL.Panini.data.categorylist = categorylist;

            this.$PL.Panini.data.Patternlibrary = this.$PL;

            // ---
            
            var pageFile = fs.readFileSync(indexPages[i]);
            //var layout   = this._getLayoutFromFile( path.join(__dirname + '/../../' + 'gui/src/layouts/patternlibrary.html') );
            var layout   = this._getLayoutFromFile( this._projectPath('gui/src/layouts/patternlibrary.html') );
            
            var rendered = this.renderPage(pageFile.toString(), layout);

            fs.ensureFileSync(targetFile);
            var pageFile = fs.writeFileSync(targetFile, rendered);

        }
        
        return (this);
        
    } // renderLayoutbuilderPages
    
    
    
    
    /**
     * render documentation
     * 
     * @return self
     */
    renderDocs ( ) { 
        
        //this.$PL.getDocParser().loadPartials( path.join(__dirname + '/../../' + 'gui/src/partials/') ); // /*/**/*.html');
        var modulePath = path.join(this.options.modulePath, 'gui/src/partials'),
            userPath   = this._projectPath('gui/src/partials');

        // load GUI partials from module
        this.$PL.getDocParser().loadPartials( path.join(modulePath) ); // /*/**/*.html');
        if (userPath != modulePath) {
            // override GUI partials from project path
            this.$PL.getDocParser().loadPartials( userPath ); // /*/**/*.html');
        }
        
        this.renderLayoutbuilderPages();
        
        // render main pattern doc
        this.renderPatternDocumentation();
        
        // render category-list pages
        this.renderCategoryListIndexPages();
        
        // render pattern-list pages
        this.renderPatternlistIndexPages();

        // render dashboard page
        this.renderDashboardPage();
        
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
    
    /**
     * determine the absolute module or user project path for a given sub-path
     * 
     * @param string dir
     * @return string
     */
    _projectPath ( dir ) {

        var cwdPath  = path.resolve(dir),
            tmplPath = (fs.existsSync(cwdPath)) ? cwdPath : path.join(this.options.modulePath, dir)
        ;
        return tmplPath;
    }
    
    
}


Patternlibrary_DocRenderer.prototype.defaults = require('./../config/default.js');

module.exports = Patternlibrary_DocRenderer;