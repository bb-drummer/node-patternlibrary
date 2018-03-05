var fs          = require('fs');
var path        = require('path');
var fm          = require('front-matter');
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
	 * @var layoutname
	 * @returns {string}
	 */
    get layoutname () {
    	return this._layoutName;
	}
	
	/**
	 * Retrieves (handlebars) layout template
	 * 
	 * if no layout is set yet, returns the default layout template
	 * 
     * @var {function} layout - a precompiled (handlebars) template
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
	 * @function layout
     * @param {string} layoutname - the file basename of the layoutfile
     */
    set layout ( layoutname ) {
    	var layoutSource = '{{> body}}';
    	this._layoutName = 'none';
    	if ( (typeof layoutname != 'undefined') && (layoutname != '') && (layoutname != 'none') && (layoutname != false) ) {
    		var layoutfile = path.join(this.options.layouts, layoutname+'.html');
    		var layoutgui  = resolvePath(path.join(this.options.gui.layouts, layoutname+'.html'));
    		
        	try {
        		if (fs.existsSync(layoutgui) && !fs.existsSync(layoutfile)) {
            		// gui layout
        			layoutfile = layoutgui;
        		}
        		layoutSource = fs.readFileSync(layoutfile).toString();
            	this._layoutName = layoutname;
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

		//markdown = isMD(pageSource);
		
    	var pageSource = page;
    	var markdown   = isMD(pageSource);
    	if ( (typeof page != 'undefined') && (page != '') && (page != 'none') && (page != false) ) {
    		var pagefile = path.join(this.options.root, this.options.basepath, page);
    		var guipage  = resolvePath(path.join(this.options.gui.pages, this.options.basepath, page));
    		
        	try {
        		if ( !fs.existsSync(pagefile) ) {
            		if ( fs.existsSync(guipage) ) {
            			// file from gui pages
                		pageSource = fs.readFileSync(guipage).toString();
                		//markdown =  isMD(guipage);
                		
            		} else {
                		if ( fs.existsSync(pageSource) ) {
                			// file from `pageSource` as a file-path by it self
                    		pageSource = fs.readFileSync(pageSource).toString();
                    		//markdown = isMD(pageSource);
                		} 
            		}
        		} else {
        			// file from pages
            		pageSource = fs.readFileSync(pagefile).toString();
            		//markdown =  isMD(pagefile);
        		}
        	} catch (e) {
        		this.log.warn('Error loading Patternlibrary pagefile "'+pagefile+'"');
        		throw new Error(e.message);
        	}
    	}
    	// strip yml data in the beginning
    	pageSource = fm(pageSource).body;
    	
    	try {
    		
    		// finally compile Markdown content, if we have a markdown file here...
    		if (markdown) {
                
        		this.log.info('Rendering Markdown content...');
        		pageSource = '{{#md}}'+pageSource+'{{/md}}'; //this.markdown.render(pageSource.replace('{', '&#x007B;'));

                //this.handlebars.registerPartial('body', this.markdown.render(pageSource) );
                
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
Patternlibrary.prototype.loadhelpers     = require('./patternlibrary/load-helpers');


Patternlibrary.prototype.run             = require('./patternlibrary/run');
Patternlibrary.prototype.parsepatterns   = require('./patternlibrary/parse-patterns');
Patternlibrary.prototype.parsecategories = require('./patternlibrary/parse-categories');
Patternlibrary.prototype.parsedocs       = require('./patternlibrary/parse-docs');

Patternlibrary.prototype.buildpages      = require('./patternlibrary/build-pages');
Patternlibrary.prototype.buildgui        = require('./patternlibrary/build-gui');
Patternlibrary.prototype.buildhelp       = require('./patternlibrary/build-help');
Patternlibrary.prototype.builddocs       = require('./patternlibrary/build-docs');
Patternlibrary.prototype.adapter         = require('./patternlibrary/adapter');

Patternlibrary.prototype.renderdata      = require('./patternlibrary/render-data');
Patternlibrary.prototype.renderdocs      = require('./patternlibrary/render-docs');
Patternlibrary.prototype.renderpattern   = require('./patternlibrary/render-pattern');
Patternlibrary.prototype.renderpage      = require('./patternlibrary/render-page');

Patternlibrary.prototype.listpatterns    = require('./patternlibrary/list-patterns');
Patternlibrary.prototype.listcategories  = require('./patternlibrary/list-categories');
Patternlibrary.prototype.statistics      = require('./patternlibrary/statistics');

Patternlibrary.prototype.searchconfig    = require('./patternlibrary/search-config');
Patternlibrary.prototype.buildsearch     = require('./patternlibrary/build-search');
Patternlibrary.prototype.updatedatafiles = require('./patternlibrary/update-datafiles');

module.exports = Patternlibrary;


function isMD ( str ) { 
	return ( (path.extname( str ) == '.md') || (path.extname( str ) == '.markdown') ); 
}