var extend = require('extend');
var fs     = require('fs');
var path   = require('path');
var rimraf = require('rimraf');
var yaml   = require('js-yaml');

/**
 * Creates an HTML page out of a documentation object
 * 
 * @param {object} data - additional template data
 * @returns {string}
 */
module.exports = function(data) {
    // Render a template with the component's data and write it to disk
    var output = '';

    // Extend file data with global data
    data = extend({}, this.data, data);

    // Catch Handlebars errors, because they won't show up in the Gulp console
    try {
    	this.pagetemplate = this.options.gui.docpage;
        output = this.pagetemplate(data);
    }
    catch(e) {
    	this.log.debug('ERROR:', e);
        throw new Error('Handlebars error: ' + e.message);
    }

    if (this.options.keepFm) {
        output = '---\n' + yaml.safeDump(data.__fm) + '\n---\n\n' + output;
    }

    return output;
}
