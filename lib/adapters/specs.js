
var fs           = require('fs');
var glob         = require('glob');
var globAll      = require('glob-all');
var path         = require('path');
var extend       = require('util')._extend;
var format       = require('string-template');
var frontMatter  = require('front-matter');
var sanatizeType = require('../util/sanatize-patterntype');

module.exports = function(value, config, cb, pl) {
    var data = getPatternSpecs (value, config, pl);
    cb(null, processTree(data));
}

module.exports.config = {
    verbose: false
}

module.exports.search = function(items, link) {
    var results = [];
    // this => collider
    /* results.push({
        name: name,
        type: 'sass ' + type,
        description: description,
        link: link + hash
    }); */

    return results;
}


function getPatternSpecs(value, config, pl) {

    var sourceFile = frontMatter(fs.readFileSync(value).toString());
    if (sourceFile.attributes.pattern && !sourceFile.attributes.pattern.type) {
    	// 'type' is not set, try to get it from 'name'
    	var parts = String(sourceFile.attributes.pattern.name).split('/');
    	if (parts.length > 1) {
    		sourceFile.attributes.pattern.type = sanatizeType(parts[0]);
    	}
    }
    return sourceFile.attributes;
}


function processTree(tree) {
    
    // do stuff

    return tree; //my_stuff;
}

