var fs              = require('fs');
var mkdirp          = require('mkdirp').sync;
var path            = require('path');
var through         = require('through2');
var vfs             = require('vinyl-fs');
var glob            = require('glob');
var globAll         = require('glob-all');
var extend          = require('extend');
var resolvePath     = require('../util/module-or-process-path');
var relativeRootUrl = require('../util/relative-root-url');

module.exports = function ( opts ) {
	
    this.time = process.hrtime();
    
    // No extra options?
    if (typeof opts === 'undefined') {
        opts = {};
    }

    // Reset the internal data tree
    if (!opts.incremental) {
       this.reset();
    }

    // Ensure destination dir
    if (this.options.dest) {
       mkdirp(path.join(this.options.dest, this.options.basepath));
    }
    
    // load data files
    if (this.options.data) {
        this.loaddata(this.options.data);
    }

    // load partials and patterns
    var orgGuiPartials = path.join(__dirname, '../../', this.options.gui.partials);
    var prjGuiPartials = path.join(process.cwd(), this.options.gui.partials);
    try {
        // load original GUI partials
        this.parsepatterns(orgGuiPartials);
        
        // load project GUI partials
        if (prjGuiPartials != orgGuiPartials) {
            this.parsepatterns(prjGuiPartials);
        }
        this.log.process("GUI partials and patterns", null, process.hrtime(this.time));
    } catch (e) {
    	this.log.debug(e);
    	throw new Error('Error loading GUI partials. '+e.message);
    }
    
    // load project patterns data
    // from main pattern source files and store in registry
    // default: [partial-path]/**/*.{html,hbs}
    var prjPatterns = path.join(process.cwd(), this.options.partials);
    try {
        if ( (prjPatterns != prjGuiPartials) && (prjPatterns != orgGuiPartials) ) {
            this.parsepatterns();
            this.log.process("project partials and patterns", null, process.hrtime(this.time));
        }
    } catch (e) {
    	this.log.debug(e);
    	throw new Error('Error loading project\'s patterns. '+e.message);
    }

    
    // get categories data from loaded patterns
    this.parsecategories();


    
    // build GUI pages
    this.buildgui();
    
    // build main pages
    this.buildpages();
    
    
    // run doc page building 
    // - either by given 'src' option 
    // - or through vinyl/gulp filestream
    //
    // the main selector are the pattern doc files
    // default: [partial-path]/**/*.{md,markdown}
    //
    // ...but first, (re)set layout and page template 
    // just to be sure ^^
    this.layout       = this.options.gui.layout;
    this.pagetemplate = this.options.gui.docpage;
    if (!this.options.src && !opts.src) {
    	var dirs        = this.options,
    	    patternDirs = dirs.pattern.dirs,
    	    key         = 'readme',
    	    streamBase  = path.join(dirs.partials),
    	    vfs_glob    = path.join(streamBase, dirs.pattern.searchpath, dirs.pattern[key]),
            stream      = vfs.src(
                vfs_glob, 
                { base: this.options.base }
            )
            .pipe(transform.apply(this));
        
        return stream;
    } else {
        return transform.apply(this);
    }

    function transform(file, enc, cb) {
        return through.obj(function(file, enc, cb) {
            this.parsedocs(file, opts, function(err, data) {
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
                data = extend(data, {
  			      root             : relativeRootUrl(filePath, rootpath),
			      baseroot         : relativeRootUrl(filePath, basepath),
			      patternsroot     : relativeRootUrl(filePath, patternspath),
			      categoriesroot   : relativeRootUrl(filePath, categoriespath)
			    });
                
                // build the doc page...
                var pageSource = this.builddocs(data);
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

