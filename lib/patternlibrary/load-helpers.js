var fs   = require('fs');
var path = require('path');
var readdir = require('../util/readdir.js');

/**
 * Looks for files with the .js extension within the given directory, and attempts to add them as Handlebars helpers.
 * @param {string} dir - Folder to check for helpers.
 */
function loadHandlebarsHelpers (dir) {
    var helpers = readdir(dir, '**/*.js');
    for (var i in helpers) {
	    var helper;
	    var name = path.basename(helpers[i], '.js');

	    try {
	        if (this.handlebars.helpers[name]){
		        //delete require.cache[require.resolve(path.join(helpers[i]))];
		        delete require.cache[path.join(process.cwd(), helpers[i])];
		        this.handlebars.unregisterHelper(name);
	        }
	
	        helper = require(path.join(process.cwd(), helpers[i]));
	        this.handlebars.registerHelper(name, helper);
	    }
	    catch (e) {
	        console.warn('Error when loading ' + name + '.js as a Handlebars helper.', helper, e);
	    }
    }
}

module.exports = loadHandlebarsHelpers; 