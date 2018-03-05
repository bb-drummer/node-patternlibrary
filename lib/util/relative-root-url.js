var path  = require('path');
var slash = require('slash');

function processRoot (page, root) {
	var pagePath = path.dirname(page);
	var rootPath = path.join(process.cwd(), root);
    var relativePath = path.relative(pagePath, rootPath);

	if (relativePath.length == 0) {
	    relativePath = '.';
	}
	if (relativePath.length > 0) {
	    relativePath += '/';
	}

	// On Windows, paths are separated with a "\"
	// However, web browsers use "/" no matter the platform : slash(...)
	return slash(relativePath);
}


module.exports = processRoot;