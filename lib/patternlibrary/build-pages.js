var fs              = require('fs');
var mkdirp          = require('mkdirp').sync;
var path            = require('path');
var through         = require('through2');
var vfs             = require('vinyl-fs');
var glob            = require('glob');
var globAll         = require('glob-all');
var extend          = require('extend');
var fm              = require('front-matter');
var resolvePath     = require('../util/module-or-process-path');
var relativeRootUrl = require('../util/relative-root-url');
var stripAbsolutePath        = require('../util/strip-absolute-path');

/**
 * run doc page building 
 * - either by given 'src' option 
 * - or through vinyl/gulp filestream
 *
 * @returns {stream} 
 */
function buildPages( source, targetdir, rootdir ) {
	if (!source) {
		source = this.options.root;
	}
	var fileglob = source;
	
	if ((typeof source == 'string') && fs.statSync(source).isDirectory()) {
		source = path.join(source, '**/*.{md,markdown,html,hbs,handlebars}');
    	fileglob = globAll.sync([
    		source,
    		'!'+path.join(this.options.root,'pl/**/*')
    	]);
	} else {
		if (Array.isArray(source)) {
			fileglob = globAll.sync(source);
		}
	}
	if (!targetdir) {
		targetdir = this.options.dest;
	}
    // the main selector are the pattern doc files
    // default: [partial-path]/**/*.{md,markdown}
    //
    // ...but first, (re)set layout and page template 
    // just to be sure ^^
    this.layout       = this.options.gui.layout;
    this.pagetemplate = this.options.gui.docpage;
    if (source) {
        var stream = vfs.src(fileglob)
                        .pipe(transformPages.apply(this))
        ; 

        return stream;
    } else {
        return transformPages.apply(this);
    }

    function transformPages(file, enc, cb) {
        return through.obj(function(file, enc, cb) {
        	
            // prepare rendering the page...
            var fileName = path.basename(file.path);
            var ext      = path.extname(file.path);
            var page     = fm(file.contents.toString());
            var markdown = isMD(file.path);
            
            // assign page layout
            var layout = page.attributes.layout || 'default';
            this.layout = layout;

            // set the file to page...
            if (markdown) {
                this.pagetemplate = '{__MDBODY__}';
            } else {
                this.pagetemplate = file.path;
            }
            
            // try O:) to normalize file's path
            var page_filepath = stripAbsolutePath(file.path)
                .replace(path.join(this.options.gui.pages, 'pl/'), '')
                .replace(path.join(this.options.root, this.options.basepath), '')
                .replace(path.join(this.options.gui.pages), '')
                .replace(path.join(this.options.root), '')
            ;
            
            var page_target = path.join(targetdir, page_filepath).replace(ext, '.html');
            file.path = page_target;
            
            var data = page.attributes;
            if (markdown) {
            	
                var markdownBody = this.markdown.render(page.body);
                this.renderpage( file.path, page_target, data, markdownBody);
                
            } else {
            	
                this.renderpage( file.path, page_target, data);
                
            }
             
            
            
            cb();
          
        }.bind(this));
    };
}

module.exports = buildPages;


function isMD ( str ) { 
	return ( (path.extname( str ) == '.md') || (path.extname( str ) == '.markdown') ); 
}