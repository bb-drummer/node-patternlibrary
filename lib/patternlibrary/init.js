var extend = require('deep-extend');
var path   = require('path');


/**
 * initializes core components and set options
 * 
 * - Handlebars instance and helpers
 * - MarkdownIt instance and plugins
 * - default doc parser adapters
 * - logger
 * 
 */
module.exports = function (opts) {
	
	if (!opts) {
		opts = {};
	}
	
	// set default options
	this.options = extend(this.options, require('../config/defaults'), opts);
	
	this.config();
	
	// init logger
	this.log = require('../util/log');
	this.log.options = this.options;
	
	// init Handlebars
	this.handlebars = require('../vendor/handlebars');
	// load optional custom Handlebars helpers
	if (this.options.helpers) {
		this.loadhelpers(this.options.helpers);
	}
	
	// init MarkdownIt and plugins
	this.markdown = require('../vendor/markdown-it');
	
	// set default doc parser adapters
	this.adapter('js')
	    .adapter('sass')
	    .adapter('specs')
	    .adapter('example')
	    .adapter('changelog')
	    .adapter('gitinfo')
	    .adapter('tests')
	    .adapter('sourcecode')
	;
	
};