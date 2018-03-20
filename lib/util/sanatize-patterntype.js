
/**
 * Sanatizes pattern type-name strings
 * 
 * default:
 * plurals -> singulars
 * 
 * `to_plural` = true:
 * singulars -> plurals
 * coverts path-style with "/" in the end: ex `atom/` becomes `atoms/`
 * 
 * @param {string} str - the plural type-name string, string containing plural type-name
 * @param {boolean} to_plural - converting mode 
 * @returns {string}
 */
function sanatizePatterntype (str, to_plural) {
	if ( (typeof to_plural != 'undefined') && (to_plural === true) ) {
		return String(str)
			.replace('atom/',      'atoms/')
			.replace('molecule/',  'molecules/')
			.replace('organism/',  'organisms/')
			.replace('component/', 'components/')
			.replace('template/',  'templates/')
			.replace('page/',      'pages/')
		;
	}
	return String(str)
	    .replace('atoms',      'atom')
	    .replace('molecules',  'molecule')
	    .replace('organisms',  'organism')
	    .replace('components', 'component')
	    .replace('templates',  'template')
	    .replace('pages',      'page')
    ;
}

module.exports = sanatizePatterntype;