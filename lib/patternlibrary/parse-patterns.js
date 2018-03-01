/**
 * register pattern data from file info
 * and registers partials to handlebars instance
 * 
 * if 'nopatterns' parameter is set to TRUE, no 
 * pattern info is registered, only the partials content
 * 
 * 
 * @param string dir - default: patterns/partials option
 * @param string searchpattern - default: pattern sourcefile searchpattern option
 * @param boolean nopatterns - default: false
 * @package Patternlibrary
 */
var fm           = require('front-matter');
var fs           = require('fs');
var path         = require('path');
var readdir      = require('../util/readdir');
var sanatizeType = require('../util/sanatize-patterntype');

module.exports = function (dir, searchpattern, nopatterns) {
	
    var patternsPath    = this.options.partials;
    var searchPattern   = path.join(this.options.pattern.searchpath, this.options.pattern.source);
    if ((typeof dir != 'undefined') && (dir !== null)) {
    	patternsPath = dir;
    }
    if ((typeof searchpattern != 'undefined') && (searchpattern !== null)) {
    	searchPattern = searchpattern;
    }
    var partials = readdir(patternsPath, searchPattern);
    if (nopatterns !== true) {
    	nopatterns = false;
    }
    
    for (var i in partials) {
        var ext  = path.extname(partials[i]);
        var file = fs.readFileSync(partials[i]);
        var name = path.basename(partials[i], ext);
        
        var pattern = fm(file.toString());

        if ( !nopatterns && pattern.attributes.pattern && (pattern.attributes.pattern.name != '') ) {
            // pattern partial
            var patternName = pattern.attributes.pattern.name;
            
            if (pattern.attributes.pattern && !pattern.attributes.pattern.type) {
                // 'type' is not set, try to get it from 'name'
                var parts = String(patternName).split('/');
                if (parts.length > 1) {
                    pattern.attributes.pattern.type = sanatizeType(parts[0]);
                }
            }
            
            var patternObject          = pattern.attributes;
            patternObject.body         = pattern.body;
            patternObject.filepath     = partials[i];
            patternObject._adapterData = {};
            
            // put pattern data into patternlibrary registry
            this.data.patterns[patternName] = patternObject;

            // register partial code to handlebars instance
            this.log.info("Pattern registered: '"+patternName+", '"+name+"'");
            this.handlebars.registerPartial(name, pattern.body + '\n');
            this.handlebars.registerPartial(patternName, pattern.body + '\n');
            
        } else {
        	
        	// register a 'normal' partial
            this.log.info("Partial registered: '"+name+"'");
            this.handlebars.registerPartial(name, pattern.body + '\n');
            
        }
        
    }

}
