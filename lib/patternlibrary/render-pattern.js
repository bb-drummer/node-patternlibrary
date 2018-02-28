var sanatizeType             = require('../util/sanatize-patterntype');
var processPatternParameters = require('../util/process-parameters');
var extend                   = require('extend');
var fm                       = require('front-matter');

/**
 * render a pattern with 'handlebars'
 * 
 * @param string body
 * @param object data
 * @return Buffer
 */
function renderPattern ( patterncontent, data ) { 

    // Get the HTML for the current page and layout
    var pattern = fm(patterncontent);
    var patternData = {};

    var patternLayout = this.handlebars.compile('{{> body}}' /*+ '\n'*/, {noEscape: true});

    try {
        var specs = pattern.attributes;
        if (specs.pattern && !specs.pattern.type) {
            // 'type' is not set, try to get it from 'name'
            var parts = String(specs.pattern.name).split('/');
            if (parts.length > 1) {
            	specs.pattern.type = sanatizeType(parts[0]);
            }
        }
        // Add this page's front matter
        patternData = extend(patternData, specs);
        patternData = extend(patternData, data);

        // Finish by adding constants
        patternData = extend(patternData, {
            // ... layout: layout
        });
        
        // parameters and defaults
        if (specs.params) {
            patternData = processPatternParameters(specs, patternData);
        }

        //patternData.Patternlibrary = this;
        // Now create Handlebars templates out of them
        var patternTemplate = this.handlebars.compile(pattern.body /*+ '\n'*/, {noEscape: true});
        
    } catch (err) {
        throw ('renderPattern Error: ', err);
    }        
    // Finally, add the page as a partial called "body", and render the layout template
    this.handlebars.registerPartial('body', patternTemplate);
    
    
    return ( patternLayout(patternData) );
    
} // renderPattern () {}

module.exports = renderPattern;