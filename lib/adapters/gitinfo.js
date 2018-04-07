
var fs          = require('fs');
var glob        = require('glob');
var globAll     = require('glob-all');
var path        = require('path');
var extend      = require('util')._extend;
var format      = require('string-template');
var frontMatter = require('front-matter');
var yaml        = require('js-yaml');

var git         = require('../util/git');

module.exports = function(value, config, cb, pl) {
    var data = getGitInfo (value, config, pl);
    //config.$PL.debug('gitinfo:', data);
    cb(null, processTree(data, config));
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


function getGitInfo(value, config, pl) {

    var logFormatYaml = 
	    '- date: \'%cd\''+'%n'+
	    '  timestamp: %ct'+'%n'+
	    '  author: %an'+'%n'+
	    '  email: %ae'+'%n'+
	    '  message: \'\"%s\"\''+'%n'+
	    '  commit: %h'+'%n'+
	    '  hash: %H'+'%n'+
	    '  body: \'\"%b\"\''+'%n'+
	    '%n';

    var logFormatCompact = 
	    '### %cd'+'%n'+
	    '%n'+
	    '- %s (%h, by [%an](mailto:%ae), <%ae>)'+'%n'+
	    '%n'+
	    '%n';

    var logFormatFull = 
	    '### %cD'+'%n'+
	    '%n'+
	    '- Author: [%an](mailto:%ae) (<%ae>)'+'%n'+
	    '%n'+
	    '  Commit: %H'+'%n'+
	    '%n'+
	    '  Message: %s'+'%n'+
	    '%n'+
	    //'  Body: \'%b\''+'%n'+
	    //'%n'+
	    //'  \\`\\`\\`diff'+'%n'+
	    //'  \`git diff %H '+value+'\`'+'%n'+
	    //'  \\`\\`\\`'+'%n'+
	    '%n';
   

    var logData    = yaml.load( getGitLog(value, logFormatYaml, config) );
    var logCompact = getGitLog(value, logFormatCompact, config);
    var logFull    = getGitLog(value, logFormatFull, config);
    
    return {
    	log: {
	    	data: logData,
	    	list: pl.markdown.render(String(logCompact)),
	    	full: pl.markdown.render(String(logFull))
	    }
    };
}


function processTree(tree, config) {

	var logs = {};
	
	for (var i in tree.log.data) {
		var obj = tree.log.data[i];
		var logdate = obj.date;
		
		if (!logs[logdate]) { logs[logdate] = []; }
		logs[logdate].push(obj);
	}
	tree.log.data = logs;
    
    return tree;
}

function getGitLog ( filepath, logFormat, config ) {
	var gitLog = git.log( filepath, 'format:"'+logFormat+'"' );
    return gitLog;
}


