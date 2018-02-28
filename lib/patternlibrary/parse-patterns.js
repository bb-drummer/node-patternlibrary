/**
 * register pattern data from file info
 * and registers partials to handlebars instance
 * 
 * 
 * @param string dir
 * @package Patternlibrary
 */
var async       = require('async');
var extend      = require('util')._extend;
//var extend = require('extend');
var format      = require('string-template');
var fm          = require('front-matter');
var fs          = require('fs');
var glob        = require('glob');
var globAll     = require('glob-all');
var marked      = require('marked');
var path        = require('path');
var readdir     = require('../util/readdir');

module.exports = function () {

    var searchPath = this.options.pattern.searchpath;
    var filenamePattern = this.options.pattern.source;
    
    var partials = readdir(this.options.partials, path.join(searchPath, filenamePattern));

    for (var i in partials) {
        var ext  = path.extname(partials[i]);
        var file = fs.readFileSync(partials[i]);
        var name = path.basename(partials[i], ext);
        
        var pattern = fm(file.toString());

        if ( pattern.attributes.pattern && (pattern.attributes.pattern.name != '') ) {
            // pattern partial
            var patternName = pattern.attributes.pattern.name;
            
            if (pattern.attributes.pattern && !pattern.attributes.pattern.type) {
                // 'type' is not set, try to get it from 'name'
                var parts = String(patternName).split('/');
                if (parts.length > 1) {
                    pattern.attributes.pattern.type = String(parts[0])
                       .replace('atoms', 'atom')
                       .replace('molecules', 'molecule')
                       .replace('organisms', 'organism')
                    ;
                }
            }
            
            var patternObject          = pattern.attributes;
            patternObject.body         = pattern.body;
            patternObject.filepath     = partials[i];
            patternObject._adapterData = {};
            
            // put pattern dsta into patternlibrary registry
            this.data.patterns[patternName] = patternObject;

            // register partial code to handlebars instance

            this.handlebars.registerPartial(name, pattern.body + '\n');
            this.handlebars.registerPartial(patternName, pattern.body + '\n');
        } else {
        	// 'normal' partial
            this.handlebars.registerPartial(name, pattern.body + '\n');
        }
        
    }

}
