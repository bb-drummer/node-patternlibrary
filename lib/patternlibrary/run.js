var chalk       = require('chalk');
var format      = require('util').format;
var fs          = require('fs');
var mkdirp      = require('mkdirp').sync;
var path        = require('path');
var through     = require('through2');
var vfs         = require('vinyl-fs');
var glob        = require('glob');
var globAll     = require('glob-all');
var extend      = require('extend');

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

    // load patterns data
    this.parsepatterns();

    // load categories data
    this.parsecategories();

    // build main pages
    this.buildpages();
    
    
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
            var time = process.hrtime();
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
  			      root             : processRoot(filePath, rootpath),
			      baseroot         : processRoot(filePath, basepath),
			      patternsroot     : processRoot(filePath, patternspath),
			      categoriesroot   : processRoot(filePath, categoriespath)
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
                this.log.process(name2log, data, process.hrtime(time));
    
                cb(null, file);
            
            }.bind(this));
          
        }.bind(this));
    };
}

function processRoot (page, root) {
	var pagePath = path.dirname(page);
	var rootPath = path.join(process.cwd(), root);
    var relativePath = path.relative(pagePath, rootPath);

	if (relativePath.length > 0) {
	    relativePath += '/';
	}

	// On Windows, paths are separated with a "\"
	// However, web browsers use "/" no matter the platform : slash(...)
	return (relativePath);
}
