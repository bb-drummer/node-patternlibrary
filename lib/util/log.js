var chalk  = require('chalk');
var format = require('util').format;

/**
 * some logging methods...
 * info, warn, debug, process
 * 
 */

/**
 * Outputs warn message to console
 * 
 * @return Patternlibrary
 */
function warn ( msg, err ) {
    var strings = {
        time    : chalk.yellow( (new Date()).toLocaleTimeString() ),
        message : chalk.yellow( msg )
    };
    console.log(
        '['+(strings.time)+'] Patternlibrary: ' + (strings.message) // + "\n"
    );
    if (err) this.debug(err);
    return (this);
}

/**
 * Outputs log message to console if verbose option is set to `true`
 * 
 * @return Patternlibrary
 */
function info ( msg ) {
    if (this.options.verbose === true) {
        var strings = {
            time    : chalk.grey( (new Date()).toLocaleTimeString() ),
            message : chalk.cyan( msg )
        };
        console.log(
            '['+(strings.time)+'] Patternlibrary: ' + (strings.message) // + "\n"
        );
    }
    return (this);
}

/**
 * Outputs debug info to console if verbose option is set to `true`
 * 
 * @return Patternlibrary
 */
function debug ( ) {
    if (this.options.verbose === true) {
        var strings = {
            time : chalk.grey( (new Date()).toLocaleTimeString() ),
            title : chalk.yellow( 'Patternlibrary Debug:' )
        };
        console.log(
            '['+(strings.time)+'] '+(strings.title)+' '+"\n",
            chalk.yellow(' >>> =================================================== <<< ') // +"\n"
        );
        for (var arg of arguments) {
            if (arg) console.log(arg);
        }
        console.log(
            chalk.yellow(' >>> =================================================== <<< ') // +"\n"
        );
    }
    return (this);
}

/**
 * Outputs the completion of a page being processed to the console.
 * 
 * @param {string} file - Name of the file.
 * @param {object} data - Data object associated with the file. The list of adapters is pulled from this.
 * @param {integer} time - Time it took to process the file.
 */
function processlog(file, data, time) {
    if (this.options.verbose === true) {
	    var msg = '';
	    var diff = (process.hrtime(time)[1] / 1000000000).toFixed(2);
	    var adapters = Object.keys(data._adapterData).join(', ');
        var strings = {
            time : chalk.grey( (new Date()).toLocaleTimeString() ),
            title : chalk.yellow( 'Patternlibrary process log:' )
        };
	
	    msg += format('[%s] Patternlibrary: processed %s in %s', (strings.time), chalk.cyan(file), chalk.magenta(diff + ' s'));
	
	    if (adapters.length) {
	        msg += format(' with %s', chalk.yellow(adapters));
	    }
	
	    console.log(msg);
    }
}


/*module.exports = {
	log    : info,
	info   : info,
	process: process,
	debug  : debug,
	warn   : warn
};*/
module.exports = function () {};
module.exports.log    = info,
module.exports.info   = info,
module.exports.process= processlog,
module.exports.debug  = debug,
module.exports.warn   = warn

