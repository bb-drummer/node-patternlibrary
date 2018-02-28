var fs      = require('fs');
var path    = require('path');

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
    		this.layout = this.options.templates.layout;
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
        	try {
        		layoutSource = fs.readFileSync(layoutfile).toString();
        	} catch (e) {
        		throw new Error('Error loading Patternlibrary layoutfile file "'+layoutname+'": ' + e.message);
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
    		this.pagetemplate = this.options.templates.docpage;
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
    	var pageSource = '';
    	if ( (typeof page != 'undefined') && (page != '') && (page != 'none') && (page != false) ) {
    		var pagefile = path.join(this.options.root, this.options.basepath, page);
        	try {
        		pageSource = fs.readFileSync(pagefile).toString();
        	} catch (e) {
        		throw new Error('Error loading Patternlibrary page file "'+pagefile+'": ' + e.message);
        	}
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
Patternlibrary.prototype.builddocs       = require('./patternlibrary/build-docs');
Patternlibrary.prototype.adapter         = require('./patternlibrary/adapter');

Patternlibrary.prototype.renderpattern   = require('./patternlibrary/render-pattern');
Patternlibrary.prototype.renderpage      = require('./patternlibrary/render-page');

Patternlibrary.prototype.searchconfig    = require('./patternlibrary/search-config');
Patternlibrary.prototype.buildsearch     = require('./patternlibrary/build-search');
Patternlibrary.prototype.updatedatafiles = require('./patternlibrary/update-datafiles');

module.exports = Patternlibrary;
