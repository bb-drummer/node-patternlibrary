var extend = require('extend');

/**
 * Assembles generic/default data for templates to render...
 * 
 * in templates/partials the key: value pair are accessible template variables `{{key}}`
 * 
 * @param {object} data
 * @param {object} opts
 * @returns
 */
function renderData ( data, opts ) {

	return extend( {}, this.data, {
		// templates' -default- key: value pairs here...
		
		// patternlibrary options
		options : this.options,
		
		// list of patterns, while `{{patterns}}` always hold all patterns
		// `{{patternlist}}` is meant to contain a filtered list of patterns
		patternlist : this.listpatterns(),

		// list of patterns, while `{{categories}}` always hold all patterns
		// `{{categorylist}}` is meant to contain a filtered list of patterns
		categorylist : this.listcategories(),
		
		// some set of generic patternlibrary statistics
		stats : this.statistics()
		
	}, data );
}

module.exports = renderData;