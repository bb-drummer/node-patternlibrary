var fs              = require('fs');
var mkdirp          = require('mkdirp').sync;
var path            = require('path');
var through         = new require('through2');
var vfs             = new require('vinyl-fs');
var glob            = require('glob');
var globAll         = require('glob-all');
var extend          = require('extend');
var resolvePath     = require('../util/module-or-process-path');
var relativeRootUrl = require('../util/relative-root-url');

/**
 * run doc page building 
 * - either by given 'src' option 
 * - or through vinyl/gulp filestream
 *
 * @returns {stream} 
 */
function buildDocs() {
	var dirs         = this.options;
	
    // the main selector are the pattern doc files
    // default: [partial-path]/**/*.{md,markdown}
    //
    // ...but first, (re)set layout and page template 
    // just to be sure ^^
    this.layout       = this.options.gui.layout;
    this.pagetemplate = this.options.gui.docpage;
    if (dirs.partials) {
        var patternDirs = dirs.pattern.dirs,
            key         = 'readme',
            streamBase  = path.join((dirs.partials), ''),
            vfs_glob    = globAll.sync(path.join(streamBase, dirs.pattern.searchpath, dirs.pattern[key])),
            //x = console.log(vfs_glob),
            stream      = vfs_glob.length ? vfs.src(vfs_glob, { base: this.options.base, allowEmpty: true })
                             .pipe(transformPatternDocs.apply(this)) : false
                             //.on('finish', function (done) { console.log(done); })
        ;
        
        return stream;
    } else {
        return transformPatternDocs.apply(this);
    }

    function transformPatternDocs(file, enc, cb) {
        return through.obj(function(file, enc, cb) {
            this.parsedocs(file, function(err, data) {
                // parsing is done... 
                
                // prepare rendering the doc page...
                var fileName = path.basename(file.path);
                var ext      = path.extname(file.path);
                var newName  = this.options.pattern.target;
    
                // new file-name
                file.path = file.path.replace(fileName, newName);
                
                var filePath = path.join(
                    this.options.dest, this.options.basepath, this.options.patternspath, 
                    path.relative(path.join(process.cwd(), this.options.partials), file.path)
                );
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
                var pageSource = this.renderdocs(data);
                /** global: Buffer */
                file.contents = new Buffer(pageSource);
    
                // Write new file to disk if necessary
                if (this.options.dest) {
                    fs.writeFileSync(filePath, file.contents.toString());
                }
                this.updatedatafiles();
    
                // Log page name, processing time, and adapters used to console
                var name2log = path.dirname(path.relative(path.join(process.cwd(), this.options.partials), file.path));
                this.log.process(name2log, data, process.hrtime(this.time));
    
                cb(null, file);
            
            }.bind(this));
          
        }.bind(this));
    };
}

module.exports = buildDocs;