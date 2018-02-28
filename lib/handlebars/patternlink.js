var handlebars = require('handlebars');
var path = require('path');

/**
 * gereate (absolute) path link to pattern(name) 
 * 
 * USAGE:
 * 
 *  ... href="{{patternlink "type/name"}}" ...
 * 
 *   
 * @param string name 
 * @return string
 * 
 */

handlebars.registerHelper('patternlink', function ( ) {

	var name     = arguments[0];
	var options  = arguments[1];
	
	const PREFIX = 'uid-';
	name = String(name)
		.replace('atom/', 'atoms/')
		.replace('molecule/', 'molecules/')
		.replace('organism/', 'organisms/')
		.replace('template/', 'templates/');
	
	var $PL = options.data.root.Patternlibrary;
	
	var linkUrl = path.join( 
		((typeof $PL != 'undefined') && $PL) ? $PL.Config.get('basepath') : '/',
		'/patterns', 
		String(name)
			.replace('atom/', 'atoms/')
			.replace('molecule/', 'molecules/')
			.replace('organism/', 'organisms/')
			.replace('template/', 'templates/')
	);
	
    return new handlebars.SafeString( linkUrl );
    
});