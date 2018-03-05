/**
 * retrieve current pattern-library data
 */
function getPatterns ( type_or_category ) { 
    if (type_or_category) {
        var patterns = {};
        for (var patternkey in this.data.patterns) {
            var pattern = this.data.patterns[patternkey];
            if ( 
                ( String(patternkey).indexOf(type_or_category) != -1 ) ||
                ( pattern.pattern.categories && ( pattern.pattern.categories.indexOf(type_or_category) != -1 ) )
            ) {
                patterns[patternkey] = pattern;                
            }
        }
        return patterns;
    }
    
    return this.data.patterns; 

}

module.exports = getPatterns;