var handlebars = require('handlebars');
var texts = require('../config/texthelper');

/**
 * simple text helper to provide consistent test-data over all patterns
 * 
 * usage:
 * {{#texthelper $mode}}
 * 
 * provides text samples for
 * - text
 * - date/time
 * - contact info
 * - product info
 * 
 * default mode: short (text)
 * 
 */
handlebars.registerHelper('texthelper', function(mode) {
	
	if (typeof mode !== 'string') {
		return texts['default'];
	}
	
	if (typeof texts[mode] === 'undefined') {
		return mode
	}
	
	return String( texts[mode] );

});
