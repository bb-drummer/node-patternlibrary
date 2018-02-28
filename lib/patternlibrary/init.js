var extend = require('extend');


// initialize stuff...
module.exports = function (opts) {
	
	if (!opts) {
		opts = {};
	}
	this._layoutTemplate = null;
	
	this.options    = extend({}, require('../config/defaults'), opts);
	
	this.log = require('../util/log');
	this.log.options = this.options;
	
	this.handlebars = require('../vendor/handlebars');
	
	this.markdown   = require('../vendor/markdown-it');
	
	this.adapter('js')
	    .adapter('sass')
	    .adapter('specs')
	    .adapter('example')
	    .adapter('changelog')
	    .adapter('gitinfo')
	    .adapter('tests')
	    //.adapter('source')
	;
	
};