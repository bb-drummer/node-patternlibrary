var path = require('path');


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
    this.pagetemplate = this.options.gui.categories;
    
    var target = path.join(this.options.basepath, this.options.categoriespath, 'index.html');
    var source = path.join(this.options.gui.pages, this.options.basepath, this.options.gui.categories);
    this.renderpage(source, target);
    this.log.process("category index pages", null, process.hrtime(this.time));
}

/**
 * Builds pattern index list pages
 * @returns
 */
function patternlists () {
    this.pagetemplate = this.options.gui.patternlist;
    
    // main pattern index (all patterns)
    var target = path.join(this.options.basepath, this.options.patternspath, 'index.html');
    var source = path.join(this.options.gui.pages, this.options.basepath, this.options.gui.patternlist);
    this.renderpage(source, target);
    this.log.process("pattern index list pages", null, process.hrtime(this.time));
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

	
};

module.exports.dashboard    = dashboard;
module.exports.categories   = categories;
module.exports.patternlists = patternlists;

