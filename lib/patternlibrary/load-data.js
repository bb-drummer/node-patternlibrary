var glob  = require('glob');
var fs    = require('fs');
var path  = require('path');
var yaml  = require('js-yaml');

/**
 * Looks for files with .js, .json, or .yml extensions within the given directory, and adds them as Handlebars variables matching the name of the file.
 * @param {string} dir - Folder to check for data files.
 */
module.exports = function(dir) {
	var dataFiles = loadFiles(dir, '**/*.{js,json,yml}');
	
	for (var i in dataFiles) {
	    var file = fs.readFileSync(dataFiles[i]);
	    var ext = path.extname(dataFiles[i]);
	    var name = path.basename(dataFiles[i], ext);
	    var data;
	
	    if (ext === '.json' || ext === '.js') {
	        delete require.cache[require.resolve(dataFiles[i])];
	        data = require(dataFiles[i])
	    }
	    else if (ext === '.yml') {
	        data = yaml.safeLoad(fs.readFileSync(dataFiles[i]));
	    }
	
	    this.data[name] = data;
	}
}

/**
 * Load a set of files
 * @param  {string|array} dir
 * @param  {string}       pattern
 * @return {array}
 */
function loadFiles (dir, pattern) {
    var files = [];

    dir = !Array.isArray(dir) ? [dir] : dir;

    for (var i in dir) {
        files = files.concat(glob.sync(path.join(process.cwd(), dir[i], pattern)));
    }

    return files;
}
