
var fs          = require('fs');
var glob        = require('glob');
var globAll     = require('glob-all');
var marked      = require('marked');
var path        = require('path');
var extend      = require('util')._extend;
var format      = require('string-template');
var frontMatter = require('front-matter');

module.exports = function(value, config, cb) {
    var data = getSourceCode (value, config);
    cb(null, processTree(data));
}

module.exports.config = {
    verbose: false
}

module.exports.search = function(items, link) {
    var results = [];
    //this.$PL.debug('page: ', page); // this => collider
    /* results.push({
        name: name,
        type: 'sass ' + type,
        description: description,
        link: link + hash
    }); */

    return results;
}


function getSourceCode(value, config) {
	if (!fs.existsSync(value)) return false;
	var sourceFile = frontMatter(fs.readFileSync(value).toString());
	var srcTemplate = ''+sourceFile.body+'';
	var result = config.$PL.getDocRenderer().renderMarkdown(srcTemplate); 
	return result;
}


function processTree(tree) {
    
    // ... my tree assignment stuff

    return tree; //my_stuff;
}

