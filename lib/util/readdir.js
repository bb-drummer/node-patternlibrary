var fs          = require('fs');
var path        = require('path');
var glob        = require('glob');
var globAll     = require('glob-all');

/**
 * recursivly read a list of files from a given directory 
 * according to a given file-path pattern
 * 
 * scans relative to project root
 * 
 * @param string|[string] dir
 * @param string pattern
 * @return [string]  
 */
function _readdir ( dir, pattern ) {
    
    var files = [];

    dir = !Array.isArray(dir) ? [dir] : dir;

    for (var i in dir) {
    	if ( fs.existsSync( dir[i] ) ) {
            files = files.concat(
                globAll.sync( path.join( dir[i], pattern ) )
            );
    	} else {
            files = files.concat(
                globAll.sync( path.join( process.cwd(), dir[i], pattern ) )
            );
    	}
    }

    return files;
    
}

module.exports = _readdir;
