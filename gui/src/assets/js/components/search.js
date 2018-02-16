/**
 * [node-patternlibrary] - Search Bar
 * 
 * This module sets up the search bar.
 *     
 * @package     [node-patternlibrary]
 * @subpackage  [node-patternlibrary] Search
 * @author      Björn Bartels <coding@bjoernbartels.earth>
 * @link        https://gitlab.bjoernbartels.earth/groups/themes
 * @license     http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
 * @copyright   copyright (c) 2016 Björn Bartels <coding@bjoernbartels.earth>
 */

import PatternlibraryCore from '../app/core';

const Search_Defaults = {
	limit: 10
}

const Search = class Search extends PatternlibraryCore.Module {

    /**
     * initializes search bar objects on page...
     * 
     * @class Search
     * @param {HTMLElement} element - DOM element to apply module
     * @param {object} options - module options
     * 
     * @module Patternlibrary.Ui.Search
     */
    constructor (element, options) {
    	super(element, options);
    	
        this.$element = element;
        this.options = $.extend({}, this.options, Search_Defaults, this.$element.data(), options);

        
        this._init();
 
        patternlibrary.Ui.initialize(this);
        
    }
  
    /**
     * Initializes the component object ...
     * @private
     */
    _init () {
    	
        // ... init stuff
        this.initSearch();
 
    };

    initSearch() {

		var
		  limit = this.options.limit,
		  searchSource = {
		    name : 'patternlibrary',
		
		    // Only show 10 results at once
		    limit: 10,
		
		    // Function to fetch result list and then find a result;
		    source: function(query, sync, async) {
			    query = query.toLowerCase();
			
			    $.getJSON('/pl/search.json', function(data, status) {
			        async(data.filter(function(elem, i, arr) {
				        var name = elem.name.toLowerCase();
				        var terms = [name, name.replace('-', '')].concat(elem.tags || []);
				        for (var i in terms) if (terms[i].indexOf(query) > -1) return true;
				        return false;
			        }));
			    });
		    },
		
		    // Name to use for the search result itself
		    display: function(item) {
		        return item.name;
		    },
		
		    templates: {
			    // HTML that renders if there are no results
			    notFound: function(query) {
			      return '<div class="tt-empty">No results for "' + query.query + '".</div>';
			    },
			    // HTML that renders for each result in the list
			    suggestion: function(item) {
			      return '<div><span class="name">' + item.name + '<span class="meta">' + item.type + '</span></span> <span class="desc">' + item.description + '</span></div>';
			    }
		    }
		};
			
		$('[data-patternlibrary-search]')
		  .typeahead({ highlight: false }, searchSource);
		
		$('[data-patternlibrary-search]')
		  .bind('typeahead:select', function(e, sel) {
		    var linkUrl = String(sel.link)
		            .replace('../patterns', '/pl/patterns')
		            .replace('/readme.html', '');
		    
		    window.location.href = linkUrl;
		    //e.preventDefault(); e.stopPropagation(); return false;
		  });
		
		// Auto-highlight unless it's a phone
		if (!navigator.userAgent.match(/(iP(hone|ad|od)|Android)/)) {
		  $('[data-patternlibrary-search]').focus();
		}
		
	};
	
    /**
     * Destroys the Component.
     * 
     * @function
     * @access private
     */
    _destroy () {
        // ... clean up stuff
    	patternlibrary.Ui.unregister(this);
    }
  
};


export default Search;
