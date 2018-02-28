var path     = require('path');
var jsonfile = require('jsonfile');

/**
 * updates the pattern-library JSON data-file
 */
function updateDataFile ( ) { 
    var _this       = this,
        patterns    = this.data.patterns,
        categories  = this.data.categories,
        destPath    = path.join(this.options.dest, this.options.basepath)
    ;
    
    // complete library data
    var file = path.join(destPath, 'patternlibrary.json');
    jsonfile.writeFileSync(file, this.data, {spaces: 4});
    
    // search data
    this.options.pageRoot = path.join(this.options.basepath, '');
    this.buildsearch(path.join(destPath, 'search.json'), function() {
    	
        // pattern data
        var file = path.join(destPath, 'patterns.json');
        jsonfile.writeFileSync(file, patterns, {spaces: 4});

        // categorie data
        var file = path.join(destPath, 'categories.json');
        jsonfile.writeFileSync(file, categories, {spaces: 4});
        
    });


    
}

module.exports = updateDataFile;
