
var fs          = require('fs');
var glob        = require('glob');
var globAll     = require('glob-all');
var marked      = require('marked');
var path        = require('path');
var extend      = require('util')._extend;
var format      = require('string-template');
var frontMatter = require('front-matter');

module.exports = function(value, config, cb) {
    var data = getPatternSpecs (value, config);
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


function getPatternSpecs(value, config) {
    if (!fs.existsSync(value)) return false;
    //config.$PL.debug('value: ', value);
    var sourceFile = frontMatter(fs.readFileSync(value).toString());
    return sourceFile.attributes;
}


function processTree(tree) {
    
    // do stuff

    return tree; //my_stuff;
}

