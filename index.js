// import in package.json via
// "node-patternlibrary": "git+https://git@gitlab.bjoernbartels.earth/js/patternlibrary"
// "node-patternlibrary": "file:../../js/node-patternlibrary"

// (global) Patternlibrary module instance
var the_patternlibrary;

// import main Patternlibrary class from file;
var Patternlibrary = require ( './lib/patternlibrary.js' );

/**
 * Patternlibrary instance factory
 * 
 * The first time the function is invoked in the stream, a new instance of 
 * the pattern-library is created with the given options.
 *
 * @param {object} options - Configuration options to pass to the new instance.
 * @returns {function} Transform stream function that renders HTML pages.
 */
module.exports = function(options) {
    if (!the_patternlibrary) {
    	the_patternlibrary = new Patternlibrary(options);
    	//the_patternlibrary.refresh();
    }

    // return initialized Patternlibrary
    return the_patternlibrary;
};

module.exports.Patternlibrary = Patternlibrary;


/**
 * CLI help message
 */
var help = function () {
	var txt = 'Usage: ...';
	process.stdout.write(txt);
}; // require('./lib/helpMessage');

module.exports.help = function() {
    help();
};
