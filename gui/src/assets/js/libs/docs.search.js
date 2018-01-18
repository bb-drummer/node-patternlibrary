/**
 * This module sets up the search bar.
 */

!function() {

var searchSource = {
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
}

$(document).ready(function () {
	
	// Search
	if (patternlibrary.debug()) console.log('search: ', $('[data-docs-search]'));
	
	$('[data-docs-search]')
	  .typeahead({ highlight: false }, searchSource);
	
	$('[data-docs-search]')
	  .bind('typeahead:select', function(e, sel) {
	    var linkUrl = String(sel.link)
	            .replace('../patterns', '/pl/patterns')
	            .replace('/readme.html', '');
	    
	    window.location.href = linkUrl;
	    //e.preventDefault(); e.stopPropagation(); return false;
	  });
	
	// Auto-highlight unless it's a phone
	if (!navigator.userAgent.match(/(iP(hone|ad|od)|Android)/)) {
	  $('[data-docs-search]').focus();
	}
	
});

}();
