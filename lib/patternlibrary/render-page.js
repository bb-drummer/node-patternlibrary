var fs                       = require('fs');
var path                     = require('path');
var extend                   = require('extend');
var fm                       = require('front-matter');
var mkdirp                   = require('mkdirp');
var relativeRootUrl          = require('../util/relative-root-url');


/**
 * render a pattern with Handlebars/Panini
 * 
 * @param string body
 * @param object data
 * @return Buffer
 */
function renderPage ( page_src, page_target, data ) { 
// function(err, data) {
	// parsing is done... 
	
	// prepare rendering the doc page...
    var fileName = path.basename(page_src);
    var ext      = path.extname(page_src);

    // new file-name
    page_src = page_src.replace(fileName, page_target);
    
    var filePath = path.join( this.options.dest, page_target );
    
    // ensure dirs...
    mkdirp(path.dirname(filePath));

    // assemble and assign root paths
    var rootpath = path.join(this.options.dest, '');
    var basepath = path.join(this.options.dest, this.options.basepath);
    var patternspath = path.join(this.options.dest, this.options.basepath, this.options.patternspath);
    var categoriespath = path.join(this.options.dest, this.options.basepath, this.options.categoriespath);
    data = extend(this.data, {
	      root             : relativeRootUrl(filePath, rootpath),
          baseroot         : relativeRootUrl(filePath, basepath),
          patternsroot     : relativeRootUrl(filePath, patternspath),
          categoriesroot   : relativeRootUrl(filePath, categoriespath)
    }, data);
    
    // build the doc page...
    var pageBody    = this.pagetemplate(data);
    this.handlebars.registerPartial('body', pageBody);
    var pageSource   = this.layout(data);
    var filecontents = new Buffer(pageSource);
    

    // Write new file to disk if necessary
    if (this.options.dest) {
        fs.writeFileSync(filePath, filecontents.toString());
    }
    this.updatedatafiles();

    // Log page name, processing time, and adapters used to console
    this.log.process(page_target, data, process.hrtime(this.time));

}
module.exports = renderPage;