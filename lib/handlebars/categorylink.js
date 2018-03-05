var handlebars = require('handlebars');
var path = require('path');
var santize = require('../util/sanatize-patterntype');

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

handlebars.registerHelper('categorylink', function ( ) {

	var name     = arguments[0],
	    helperoptions  = arguments[1],
	    data = helperoptions.data.root
	;
	
	var linkUrl = path.join( 
		data.categoriesroot, 
		santize(name, true)
	);
	
    return new handlebars.SafeString( linkUrl );
    
});