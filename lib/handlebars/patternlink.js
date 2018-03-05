var handlebars = require('handlebars');
var path = require('path');
var santize = require('../util/sanatize-patterntype');

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

	var name     = arguments[0],
	    helperoptions  = arguments[1],
	    data = helperoptions.data.root
	;
	
	var linkUrl = path.join( 
		data.patternsroot, 
		santize(name, true)
	);
	
    return new handlebars.SafeString( linkUrl );
    
});