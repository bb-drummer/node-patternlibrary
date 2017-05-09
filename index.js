var patternlibrary;

//import Patternlibrary from './lib/class.patternlibrary.js';
var Patternlibrary = require ( './lib/class.patternlibrary.js' );

/**
 * Gulp stream function that renders HTML pages. 
 * 
 * The first time the function is invoked in the stream, a new instance of 
 * the pattern-library is created with the given options.
 *
 * @param {object} options - Configuration options to pass to the new instance.
 * @returns {function} Transform stream function that renders HTML pages.
 */
module.exports = function(options) {
  if (!patternlibrary) {
	  patternlibrary = new Patternlibrary(options);
	  patternlibrary.refresh();
      module.exports.refresh = patternlibrary.refresh.bind(patternlibrary);
      module.exports.middleware = patternlibrary.middleware.bind(patternlibrary);
  }

  // Compile pages with the above helpers
  return patternlibrary.processFileStream();
};

module.exports.Patternlibrary = Patternlibrary;
module.exports.refresh = Patternlibrary.refresh;
module.exports.middleware = Patternlibrary.middleware;


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
