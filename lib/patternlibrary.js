var fs      = require('fs');
var path    = require('path');
var resolvePath = require('./util/module-or-process-path');

class Patternlibrary {
	
	constructor (opts) {
	    this.options       = {};
	    this.adapters      = {};
	    
	    this.handlebars    = null;
	    this.markdown      = null;
	    
	    this.template      = null;
	    this.time          = null;
	    
	    this.searchOptions = {
		    extra     : [],
		    sort      : [],
		    pageTypes : {}
	    };
	    
	    this.reset();
	    this.init(opts);
	}
	
	/**
	 * resets/clears all data
	 */
	reset () {
	    this.data = {
	    	patterns  : {},
	    	categories: {}
	    };
	    return (this);
	}
	
	/**
	 * Retrieves (handlebars) layout template
	 * 
	 * if no layout is set yet, returns the default layout template
	 * 
	 * @function layout
	 * @param {object} data - template data
	 * @returns {string}
	 */
    get layout () {
    	if (!this._layoutTemplate) {
    		this.layout = this.options.gui.layout;
    	}
    	return this._layoutTemplate;
    }
	
    /**
     * Sets and compiles (handlebars) layout by the file basename of the layoutfile
     * 
     * if no name is given an 'empty' layout ('{{> body}}') is set
     * 
     * @param {string} layoutname - the file basename of the layoutfile
     * @var {function} layout - a precompiled (handlebars) template
     */
    set layout ( layoutname ) {
    	var layoutSource = '{{> body}}';
    	if ( (typeof layoutname != 'undefined') && (layoutname != '') && (layoutname != 'none') && (layoutname != false) ) {
    		var layoutfile = path.join(this.options.layouts, layoutname+'.html');
    		var layoutgui  = resolvePath(path.join(this.options.gui.layouts, layoutname+'.html'));
    		
        	try {
        		if (fs.existsSync(layoutgui) && !fs.existsSync(layoutfile)) {
            		// gui layout
        			layoutfile = layoutgui;
        		}
        		layoutSource = fs.readFileSync(layoutfile).toString();
        	} catch (e) {
        		this.log.warn('Error loading Patternlibrary layoutfile file "'+layoutname+'"');
        		throw new Error(e.message);
        	}
    	}
    	this._layoutTemplate = this.handlebars.compile(layoutSource, {noEscape: true});
    }
    
	/**
	 * Retrieves (handlebars) page template
	 * 
	 * if no layout is set yet, returns the default layout template
	 * 
	 * @function layout
	 * @param {object} data - template data
	 * @returns {string}
	 */
    get pagetemplate () {
    	if (!this._pageTemplate) {
    		this.pagetemplate = this.options.gui.docpage;
    	}
    	return this._pageTemplate;
    }
	
    /**
     * Sets and compiles (handlebars) page by page filename
     * 
     * if no name is given an 'empty' layout ('{{> body}}') is set
     * 
     * @param {string} layoutname - the file basename of the layoutfile
     * @var {function} layout - a precompiled (handlebars) template
     */
    set pagetemplate ( page ) {
    	var pageSource = page;
    	var markdown   = false;
    	if ( (typeof page != 'undefined') && (page != '') && (page != 'none') && (page != false) ) {
    		var pagefile = path.join(this.options.root, this.options.basepath, page);
    		var guipage  = resolvePath(path.join(this.options.gui.pages, this.options.basepath, page));
    		
        	try {
        		if ( !fs.existsSync(pagefile) ) {
            		if ( fs.existsSync(guipage) ) {
            			// file from gui pages
                		pageSource = fs.readFileSync(guipage).toString();
                		markdown = path.extname(guipage) == 'md';
            		}
        		} else {
        			// file from pages
            		pageSource = fs.readFileSync(pagefile).toString();
            		markdown = path.extname(pagefile) == 'md';
        		}
        	} catch (e) {
        		this.log.warn('Error loading Patternlibrary pagefile "'+pagefile+'"');
        		throw new Error(e.message);
        	}
    	}
    	try {
    		
    		// finally compile Markdown content, if we have a markdown file here...
    		if (markdown) {
        		pageSource = this.markdown.render(pageSource);
    		}
    		
    	} catch (e) {
    		this.log.warn('Error rendering Markdown content');
    		throw new Error(e.message);
    	}
    	this._pageTemplate = this.handlebars.compile(pageSource, {noEscape: true});
    }
    
}

Patternlibrary.prototype.init            = require('./patternlibrary/init');
Patternlibrary.prototype.config          = require('./patternlibrary/config');
Patternlibrary.prototype.loaddata        = require('./patternlibrary/load-data');


Patternlibrary.prototype.run             = require('./patternlibrary/run');
Patternlibrary.prototype.parsepatterns   = require('./patternlibrary/parse-patterns');
Patternlibrary.prototype.parsecategories = require('./patternlibrary/parse-categories');
Patternlibrary.prototype.parsedocs       = require('./patternlibrary/parse-docs');

Patternlibrary.prototype.buildpages      = require('./patternlibrary/build-pages');
Patternlibrary.prototype.buildgui        = require('./patternlibrary/build-gui');
Patternlibrary.prototype.buildhelp       = require('./patternlibrary/build-help');
Patternlibrary.prototype.builddocs       = require('./patternlibrary/build-docs');
Patternlibrary.prototype.adapter         = require('./patternlibrary/adapter');

Patternlibrary.prototype.renderpattern   = require('./patternlibrary/render-pattern');
Patternlibrary.prototype.renderpage      = require('./patternlibrary/render-page');

Patternlibrary.prototype.searchconfig    = require('./patternlibrary/search-config');
Patternlibrary.prototype.buildsearch     = require('./patternlibrary/build-search');
Patternlibrary.prototype.updatedatafiles = require('./patternlibrary/update-datafiles');

module.exports = Patternlibrary;
