
/**
 * Sanatizes pattern tyop-name strings
 * 
 * plurals -> singulars
 * 
 * @param {string} str - the plural type-name string, string containing plural type-name
 * @returns {string}
 */
function sanatizePatterntype (str) {
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