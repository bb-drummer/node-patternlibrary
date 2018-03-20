//var extend   = require('util')._extend;
var extend   = require('deep-extend');
var fs       = require('fs');
var path     = require('path');
var fm       = require('front-matter');


/**
 * checks for pattern doc options
 * @param {Patternlibrary} $pl
 * @returns
 */
function checkBase ( $pl ) {
	
	// patterns dir
	if (!$pl.options.partials || ($pl.options.partials == '')) {
		throw new Error('To generate pattern documentation a source "partials" path option must be set.');
	}
	
	// destination dir
	if (!$pl.options.dest || ($pl.options.dest == '')) {
		throw new Error('A destination directory "dest" option must be set.');
	}
	
	// serving basepath
	if (!$pl.options.basepath || ($pl.options.basepath == '')) {
		throw new Error('An URL "basepath" sub-path option must be set.');
	}
	
	// serving patterns sub-path
	if (!$pl.options.patternspath || ($pl.options.patternspath == '')) {
		throw new Error('An URL "patternspath" sub-path option must be set.');
	}
	
	// serving categories sub-path
	if (!$pl.options.categoriespath || ($pl.options.categoriespath == '')) {
		throw new Error('An URL "categoriespath" sub-path option must be set.');
	}
}

/**
 * checks for patterns options
 * @param {Patternlibrary} $pl
 * @returns
 */
function checkPatterns ( $pl ) {
	
		if (!$pl.options.pattern) {
			throw new Error('The pattern\'s options must be defined.');
		}
		
		if (!$pl.options.pattern.dirs) {
			throw new Error('The patterns\' "dirs" sub-path option must be set.');
		}
		if (!$pl.options.pattern.dirs.atoms) {
			throw new Error('The patterns\' "atoms" sub-path option must be set.');
		}
		if (!$pl.options.pattern.dirs.molecules) {
			throw new Error('The patterns\' "molecules" sub-path option must be set.');
		}
		if (!$pl.options.pattern.dirs.organisms) {
			throw new Error('The patterns\' "molecules" sub-path option must be set.');
		}
		if (!$pl.options.pattern.dirs.templates) {
			throw new Error('The patterns\' "molecules" sub-path option must be set.');
		}
		if (!$pl.options.pattern.dirs.pages) {
			throw new Error('The patterns\' "molecules" sub-path option must be set.');
		}

		if (!$pl.options.pattern.searchpath) {
			throw new Error('The patterns\' "searchpath" sub-path pattern option must be set.');
		}
		if (!$pl.options.pattern.target) {
			throw new Error('The patterns\' "target" filename option must be set.');
		}

}

/**
 * checks for patterns default doc adapter search-patterns options
 * @param {Patternlibrary} $pl
 * @returns
 */
function checkPatternsAdapterPatterns ( $pl ) {
	
		if (!$pl.options.pattern.source) {
			throw new Error('The patterns\' default adapter "source" search pattern option must be set.');
		}
		if (!$pl.options.pattern.readme) {
			throw new Error('The patterns\' default adapter "readme" search pattern option must be set.');
		}
		if (!$pl.options.pattern.scss) {
			throw new Error('The patterns\' default adapter "scss" search pattern option must be set.');
		}
		if (!$pl.options.pattern.javascript) {
			throw new Error('The patterns\' default adapter "javascript" search pattern option must be set.');
		}
		if (!$pl.options.pattern.tests) {
			throw new Error('The patterns\' default adapter "tests" search pattern option must be set.');
		}
		if (!$pl.options.pattern.changelog) {
			throw new Error('The patterns\' default adapter "changelog" search pattern option must be set.');
		}
		
}

/**
 * checks for gui options
 * @param {Patternlibrary} $pl
 * @returns
 */
function checkGUI ( $pl ) {
	if ($pl.options.nogui !== false) {
		if (!$pl.options.gui) {
			throw new Error('GUI options must be defined.');
		}
		if (!$pl.options.gui.pages) {
			throw new Error('To generate GUI a source "pages" path option must be set.');
		}
		if (!$pl.options.gui.partials) {
			throw new Error('To generate GUI a source "partials" path option must be set.');
		}
		if (!$pl.options.gui.layouts) {
			throw new Error('To generate GUI a source "layouts" path option must be set.');
		}
		if (!$pl.options.gui.layout) {
			throw new Error('To generate GUI a default "layout" template option must be set.');
		}
		if (!$pl.options.gui.docpage) {
			throw new Error('To generate GUI a default "docpage" template option must be set.');
		}
		if (!$pl.options.gui.dashboard) {
			throw new Error('To generate GUI a default "dashboard" template option must be set.');
		}
		if (!$pl.options.gui.patternlist) {
			throw new Error('To generate GUI a default "patternlist" template option must be set.');
		}
		if (!$pl.options.gui.categorylist) {
			throw new Error('To generate GUI a default "categorylist" template option must be set.');
		}
	}
}

/**
 * checks for static pages options
 * @param {Patternlibrary} $pl
 * @returns
 */
function checkStaticPages ( $pl ) {
	if ($pl.options.staticpages !== false) {
		if (!$pl.options.root) {
			throw new Error('To generate static pages a source "root" path option must be set.');
		}
		if (!$pl.options.layouts) {
			throw new Error('To generate static pages a source "layouts" path option must be set.');
		}
	}
}


module.exports = function(opts) {

	if (!opts) {
		opts = {};
	}
	
    this.options = extend(this.options, {
	    pageRoot  : process.cwd()
    }, opts);
    
    
    checkBase(this);
    
    checkPatterns(this);
    checkPatternsAdapterPatterns(this);
    
    checkGUI(this);
    
    checkStaticPages(this);

    return this;
}
