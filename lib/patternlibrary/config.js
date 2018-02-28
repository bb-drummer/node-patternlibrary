var extend   = require('util')._extend;
var fs       = require('fs');
var path     = require('path');
var fm       = require('front-matter');

module.exports = function(opts) {
    
    this.options = extend(this.options, {
	    data      : {},
	    pageRoot  : process.cwd()
    }, opts);

    // initialises doc page as body-partial and compiled template
    if (this.options.pattern.layout) {
        if (this.options.pattern.docpage) {
		    try {
		    	var pagefile   = path.join(this.options.root, this.options.basepath, this.options.pattern.docpage);
		        var pageSource = fs.readFileSync(pagefile);
		        var page       = fm(pageSource.toString());
		    	if (page.attributes.layout != '') {
		        	this.layout = page.attributes.layout;
		        }
		    } catch (e) {
		        throw new Error('Error loading Patternlibrary doc page template file: ' + e.message);
		    }
		    
            // Now create Handlebars templates out of them
            this.template = this.handlebars.compile(page.body, {noEscape: true});
                    
            // Finally, add the page as a partial called "body", and render the layout template
            this.handlebars.registerPartial('body', this.template);
            
        } else {
            throw new Error('No path to a doc page template was set in Patternlibrary.config().');
        }
    } else {
        throw new Error('No path to a layout was set in Patternlibrary.config().');
    }

    return this;
}
