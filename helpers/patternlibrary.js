var extend  = require('deep-extend');

/**
 * includes/renders a pattern into current position
 * (wraps Handlebars'/Panini's {{> ...}} helper)
 * 
 */
module.exports = function(options) {
	
	var $PL = options.data.root.Patternlibrary;
	var patterns = $PL.getPatterns();
	var patternContent = '';
	var patternData = {};

    extend(patternData, $PL.Panini.data);
    
	if (typeof options.hash.atom != 'undefined') {
		var patternName = 'atom/'+options.hash.atom;
	}
	if (typeof options.hash.molecule != 'undefined') {
		var patternName = 'molecule/'+options.hash.molecule;
	}
	if (typeof options.hash.organism != 'undefined') {
		var patternName = 'organism/'+options.hash.organism;
	}
	if (typeof options.hash.template != 'undefined') {
		var patternName = 'template/'+options.hash.template;
	}
	if (typeof patterns[patternName] != 'undefined') {
		patternContent = patterns[patternName].body;
		$PL.patternUsage(patternName, this);
	} else {
		patternContent = '';
	}
	options.data.root.Patternlibrary = null ;
	extend(patternData, patterns[patternName]);
	extend(patternData, options.data.root);
	extend(patternData, options.hash);
    
    $PL.updateDataFile();
	options.data.root.Patternlibrary = $PL ;

	var result = new $PL.Handlebars.SafeString( $PL.renderPattern(patternContent , patternData) );
	
	return (result);
	
}
