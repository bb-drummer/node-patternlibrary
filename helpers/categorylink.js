var Handlebars = require('handlebars');
var path = require('path');

/**
 * gereate (absolute) path link to category(index) 
 * 
 * USAGE:
 * 
 *  ... href="{{categorylink "slug"}}" ...
 * 
 *   
 * @param string name 
 * @return string
 * 
 */

module.exports = function ( ) {

	var name     = arguments[0];
	var options  = arguments[1];
	
	const PREFIX = 'uid-';
	name = String(name)
		.replace('atom/', 'atoms/')
		.replace('molecule/', 'molecules/')
		.replace('organism/', 'organisms/')
		.replace('template/', 'templates/');
	
	var $PL = options.data.root.Patternlibrary;
	if ( (typeof $PL == 'undefined') ) {
		$PL = options.data.Patternlibrary;
	}
	
	var linkUrl = path.join( 
		((typeof $PL != 'undefined') && $PL) ? $PL.Config.get('basepath') : '/',
		'/categories', 
		String(name)
			.replace('atom/', 'atoms/')
			.replace('molecule/', 'molecules/')
			.replace('organism/', 'organisms/')
			.replace('template/', 'templates/')
	);
	
    return new Handlebars.SafeString( linkUrl );
    
}