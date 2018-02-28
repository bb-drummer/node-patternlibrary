

/**
 * render a pattern with Handlebars/Panini
 * 
 * @param string body
 * @param object data
 * @return Buffer
 */
function renderPattern ( filecontent, data ) { 

    // Get the HTML for the current page and layout
    var page = fm(filecontent);
    var patternData = {};

    // Determine which layout to use
    var layout =
        page.attributes.layout ||
        this.$PL.options.templates.layout;
    //var layoutTemplate = this.$PL.Panini.layouts[layout];
    // alternatively, prepare an 'empty' layout' : 
    var layoutTemplate = this.$PL.Handlebars.compile('{{> body}}' /*+ '\n'*/, {noEscape: true});

    if (!layoutTemplate) {
        if (layout === 'default') {
            throw new Error('Patternlibrary error: you must have a layout named "default".');
        }
        else {
            throw new Error('Patternlibrary error: no layout named "'+layout+'" exists.');
        }
    }

    try {

        data.Patternlibrary = null ;
        if (page.attributes.pattern && !page.attributes.pattern.type) {
            // 'type' is not set, try to get it from 'name'
            var parts = String(page.attributes.pattern.name).split('/');
            if (parts.length > 1) {
                page.attributes.pattern.type = String(parts[0])
                   .replace('atoms', 'atom')
                   .replace('molecules', 'molecule')
                   .replace('organisms', 'organism')
                ;
            }
        }
        // Add this page's front matter
        patternData = extend(patternData, page.attributes);
        patternData = extend(patternData, data);

        // Finish by adding constants
        patternData = extend(patternData, {
            layout: layout
        });
        
        // parameters and defaults
        patternData = this._processPatternParameterValues(patternData);

        patternData.Patternlibrary = this.$PL;
        // Now create Handlebars templates out of them
        var pageTemplate = this.$PL.Handlebars.compile(page.body /*+ '\n'*/, {noEscape: true});
        
    } catch (err) {
        this.$PL.warn('renderPattern Error: ', err);
    }        
    // Finally, add the page as a partial called "body", and render the layout template
    this.$PL.Handlebars.registerPartial('body', pageTemplate);
    
    
    return ( layoutTemplate(patternData) );
    
} // renderPattern () {}

module.exports = renderPattern;