var fs                       = require('fs');
var path                     = require('path');
var extend                   = require('extend');
var fm                       = require('front-matter');
var mkdirp                   = require('mkdirp').sync;
var relativeRootUrl          = require('../util/relative-root-url');


/**
 * render a pattern with Handlebars/Panini
 * 
 * @param string page_src
 * @param string page_target
 * @param object data
 * @param string markdown
 * @return Buffer
 */
function renderPage ( page_src, page_target, data, markdown ) { 
	
	//// ??? still using 'page_src' here ???
	
    
	if (this.options.dest) {
		// normalize path
		page_target = String(page_target).replace(this.options.dest, '');
	}
	
    var filePath = path.join( this.options.dest, page_target );
    
    // ensure dirs...
    mkdirp(path.dirname(filePath));

    // assemble and assign root paths
    var rootpath = path.join(this.options.dest, '');
    var basepath = path.join(this.options.dest, this.options.basepath);
    var patternspath = path.join(this.options.dest, this.options.basepath, this.options.patternspath);
    var categoriespath = path.join(this.options.dest, this.options.basepath, this.options.categoriespath);
    data = this.renderdata(extend({
  	      page             : path.basename(filePath, path.extname(filePath)),
	      layout           : this.layoutname,
          root             : relativeRootUrl(filePath, rootpath),
          baseroot         : relativeRootUrl(filePath, basepath),
          patternsroot     : relativeRootUrl(filePath, patternspath),
          categoriesroot   : relativeRootUrl(filePath, categoriespath)
    }, data));

    // Add special ad-hoc partials for #ifpage and #unlesspage
    this.handlebars.registerHelper('ifpage', require('../handlebars/ifPage')(data.page));
    this.handlebars.registerHelper('unlesspage', require('../handlebars/unlessPage')(data.page));

    // build the doc page...
    var pageBody    = this.pagetemplate(data);
    this.handlebars.registerPartial('body', pageBody);
    var pageSource   = this.layout(data);

    if (markdown) {
        pageSource = String(pageSource).replace('{__MDBODY__}', markdown);
    }
    
    /** global: Buffer */
    var filecontents = new Buffer(pageSource);
    

    // Write new file to disk if necessary
    if (this.options.dest) {
        fs.writeFileSync(filePath, filecontents.toString());
    }
    this.updatedatafiles();

    // Log page name, processing time, and adapters used to console
    this.log.process(page_target, data, process.hrtime(this.time));

    return filecontents.toString();
}
module.exports = renderPage;