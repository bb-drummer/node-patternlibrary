var extend          = require('extend');
var fs              = require('fs');
var mkdirp          = require('mkdirp').sync;
var path            = require('path');
var through         = require('through2');
var vfs             = require('vinyl-fs');
var glob            = require('glob');
var globAll         = require('glob-all');
var resolvePath     = require('../util/module-or-process-path');
var relativeRootUrl = require('../util/relative-root-url');
//var PassThrough     = require('stream');
const {PassThrough} = require('stream');

module.exports = function ( opts ) {
    
    this.time = process.hrtime();
    
    // No extra options?
    if (typeof opts === 'undefined') {
        opts = {};
    }

    // Reset the internal data tree
    if (!opts.incremental) {
       this.reset();
    }

    // Ensure destination dir
    if (this.options.dest) {
       mkdirp(path.join(this.options.dest, this.options.basepath));
    }
    
    // load data files
    if (this.options.data) {
        this.loaddata(this.options.data);
    }

    // load partials and patterns
    var orgGuiPartials = path.join(__dirname, '../../', this.options.gui.partials);
    var prjGuiPartials = path.join(process.cwd(), this.options.gui.partials);
    try {
        // load original GUI partials
        // if (prjGuiPartials != orgGuiPartials), we have 
        // a self-documenting new PL project
        this.parsepatterns( orgGuiPartials, null, ((prjGuiPartials != orgGuiPartials) || this.options.testing));
        
        // load project GUI partials
        if (prjGuiPartials != orgGuiPartials) {
            this.parsepatterns(prjGuiPartials);
        }
        this.log.process("GUI partials and patterns", null, process.hrtime(this.time));
    } catch (e) {
        this.log.debug(e);
        throw new Error('Error loading GUI partials. '+e.message);
    }
    
    // load project patterns data
    // from main pattern source files and store in registry
    // default: [partial-path]/**/*.{html,hbs}
    var prjPatterns = path.join(process.cwd(), this.options.partials);
    try {
        if ( (prjPatterns != prjGuiPartials) && (prjPatterns != orgGuiPartials) || this.options.testing ) {
            this.parsepatterns();
            this.log.process("project partials and patterns", null, process.hrtime(this.time));
        }
    } catch (e) {
        this.log.debug(e);
        throw new Error('Error loading project\'s patterns. '+e.message);
    }


    var _this = this;
    
    // build pattern doc pages
    var docpages = this.builddocs();
    if (docpages) {
        docpages.on('finish', function () {
    		_this.log.process('pattern doc pages', _this.data, process.hrtime(_this.time));
    	});
    }

    if (this.options.nogui === false) {
        // build GUI pages, category and pattern indexes
        this.buildgui();
        this.log.process('GUI pages', this.data, process.hrtime(this.time));
    }
    
    // build user/project 'pages'
	var userpages = this.buildpages();
	if (userpages) {
		userpages.on('finish', function () {
			_this.log.process('user pages', _this.data, process.hrtime(_this.time));
		});
	}
	
	// return back a/the stream object
	return userpages;
	
	
}

