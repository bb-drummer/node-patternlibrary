
var patternByCategorySlug = require('../util/filter-patterns.js');

module.exports = function ( ) { 
    var patterns  = this.data.patterns;

    // categories data
    var categories = [];
    for (var pattern in patterns) {
        var patterncategories = 
            !Array.isArray(patterns[pattern].pattern.categories) ? 
                [patterns[pattern].pattern.categories] : 
                    patterns[pattern].pattern.categories;
        for (var i in patterncategories) {
            var cat = { 
                name: String(patterncategories[i]),
                slug: String(patterncategories[i])
            };
            if ( !isCatInList( categories, cat, 'slug' ) ) {
                var catPatterns = patternByCategorySlug(cat.slug, patterns);
                cat.patterns = catPatterns;
                cat.patternsCount = ((b) => {
                    var c = 0; for (var a in b) { c++; }; return c;
                })(catPatterns);
                categories.push(cat);
            }
        }
    }
    
    categories = sortByKey(categories, 'slug');
    this.data.categories = categories;
    return (categories);
}

function isCatInList ( arr, obj, key ) {
    for (var idx in arr) {
        if ( arr[idx][key] && obj[key] && (arr[idx][key] == obj[key]) ) {
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
