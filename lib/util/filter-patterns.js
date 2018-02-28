/**
 * retrieve filtered given list by type or category slug
 */
function filterPatterns ( type_or_category, data ) { 
    if (type_or_category) {
        var patterns = {};
        for (var patternkey in data) {
            var pattern = data[patternkey];
            if ( 
                ( String(patternkey).indexOf(type_or_category) != -1 ) ||
                ( pattern.pattern.categories && ( pattern.pattern.categories.indexOf(type_or_category) != -1 ) )
            ) {
                patterns[patternkey] = pattern;                
            }
        }
        return patterns;
    }
    
    return data; 

}

module.exports = filterPatterns;