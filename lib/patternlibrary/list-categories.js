/**
 * retrieve current list of pattern categories
 */
function getCategories ( ) { 
    var patterns  = this.listpatterns();

    function isCatInList ( arr, obj, idx ) {
    	for (var i in arr) {
    		if ( arr[i][idx] && obj[idx] && (arr[i][idx] == obj[idx]) ) {
    			return (true);
    		}
    	}
    	return false;
    }
    function sortByKey(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }
    
    // categories data
    var categories = [];
    for (var pattern in patterns) {
    	var patterncategories = [];
    	if (patterns[pattern].pattern && patterns[pattern].pattern.categories) {
	        var patterncategories = 
	            !Array.isArray(patterns[pattern].pattern.categories) ? 
	                [patterns[pattern].pattern.categories] : 
	                    patterns[pattern].pattern.categories;
    	}
        for (var i in patterncategories) {
            var cat = { 
                name: String(patterncategories[i]),
                slug: String(patterncategories[i])
            };
            if ( !isCatInList( categories, cat, 'slug' ) ) {
            	var catPatterns = this.listpatterns(cat.slug);
            	cat.patterns = catPatterns;
            	cat.patternsCount = (function (b) {
            		var c = 0; for (var a in b) { c++; }; return c;
            	})(catPatterns);
                categories.push(cat);
            }
        }
    }
    
    categories = sortByKey(categories, 'slug');
    return (categories);
}

module.exports = getCategories;