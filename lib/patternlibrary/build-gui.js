var path = require('path');
var mkdirp = require('mkdirp');
var globAll         = require('glob-all');
var resolvePath     = require('../util/module-or-process-path');
var sanatizeType = require('../util/sanatize-patterntype');

/**
 * Builds dashboard page
 * @returns
 */
function dashboard () {
    this.pagetemplate = this.options.gui.dashboard;
    var target = path.join(this.options.basepath, 'index.html');
    var source = path.join(this.options.gui.pages, this.options.basepath, this.options.gui.dashboard);
    this.renderpage(source, target);
    this.log.process("dashboard page", null, process.hrtime(this.time));	
}

/**
 * Builds category index pages
 * @returns
 */
function categories () {
    this.pagetemplate = this.options.gui.categorylist;
    
    var source = path.join(this.options.gui.pages, this.options.basepath, this.options.gui.categorylist);
    var target = path.join(this.options.basepath, this.options.categoriespath, 'index.html');
    this.renderpage(source, target);
    
    var categories = this.listcategories();
    this.pagetemplate = this.options.gui.patternlist;
    source = path.join(this.options.gui.pages, this.options.basepath, this.options.gui.patternlist);
    for (var cat in categories) {
        target = path.join(this.options.basepath, this.options.categoriespath, categories[cat].slug, 'index.html');
        mkdirp(path.dirname(target));
        this.renderpage(source, target, {
        	patternlist: this.listpatterns(categories[cat].slug)
        });
    }

    this.log.process("category index pages", null, process.hrtime(this.time));
}

/**
 * Builds pattern index list pages
 * @returns
 */
function patternlists () {
    this.pagetemplate = this.options.gui.patternlist;
    
    // main pattern index (all patterns)
    var target = path.join(this.options.basepath, this.options.patternspath, this.options.gui.patternlist);
    var source = path.join(this.options.gui.pages, this.options.basepath, this.options.gui.patternlist);
    this.renderpage(source, target);

    var patterntypes = ['atom','molecule','organism','templates','pages'];
    for (var i in patterntypes) {
        target = path.join(this.options.basepath, this.options.patternspath, sanatizeType(patterntypes[i]+'/', true), 'index.html');
        mkdirp(path.dirname(target));
        this.renderpage(source, target, {
        	patternlist: this.listpatterns(patterntypes[i])
        });
    }
    
    this.log.process("pattern index list pages", null, process.hrtime(this.time));
}

/**
 * Builds patternlibrary help pages
 * @returns
 */
function helpdocs () {

	var _this = this;
	// build patternlibrary help pages
    var helppages = this.buildpages(globAll.sync(
    	[path.join(resolvePath(this.options.gui.pages),'pl/{help,pages}/**/*.{md,markdown,html,hbs,handlebars}')]
    ), path.join(this.options.dest, this.options.basepath));
    helppages.on('finish', function () {
		_this.log.process('help pages', _this.data, process.hrtime(_this.time));
	});
    

}


/**
 * Builds GUI pages...
 */
module.exports = function () {
	
    // set gui layout
    this.layout       = this.options.gui.layout;
    
	// dashboard
    this.buildgui.dashboard.apply(this);
    
    // categories
    this.buildgui.categories.apply(this);

	// pattern indexes
    this.buildgui.patternlists.apply(this);

	// patternlibrary help
    this.buildgui.helpdocs.apply(this);

	
};

module.exports.dashboard    = dashboard;
module.exports.categories   = categories;
module.exports.patternlists = patternlists;
module.exports.helpdocs     = helpdocs;

