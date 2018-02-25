var extend        = require('deep-extend');
var curl          = require('curl'); // 0.1.4
var queryString   = require('query-string'); // 4.3.4
var fm            = require('front-matter');
var fs            = require('fs-extra');
var glob          = require('glob');
var path          = require('path');
var chalk         = require('chalk');
var through       = require('through2');
var slash         = require('slash');
var jsonfile      = require('jsonfile');
var Panini        = require('panini'); 
var superCollider = require('supercollider');
var marked        = require('marked');

// import Foundation Docs handlebar helpers
require('./vendor/handlebars');

//import Patternlibrary classes
var PatternlibraryConfig      = require('./patternlibrary/config');

var PatternlibraryFileStream  = require('./patternlibrary/filestream');
var PatternlibraryDocParser   = require('./patternlibrary/doc-parser');
var PatternlibraryDocRenderer = require('./patternlibrary/doc-renderer');

var PatternlibraryMiddleware  = require('./patternlibrary/middleware');


/** @var string patternlibrary version */
const PATTERNLIBRARY_VERSION = require('../package.json').version; // '0.0.1';

/**
 * Patternlibrary Generator
 * 
 * @package Patternlibrary
 * @namespace Patternlibrary
 * @author Björn Bartels <coding@bjoernbartels.earth>
 */
class Patternlibrary {
    
    /**
     * Initializes an instance of Patternlibrary.
     * @constructor
     * @param {object} options - Configuration options to use.
     */
    constructor ( options ) {
        
        /** @var string */
        this.patternlibrary_version = PATTERNLIBRARY_VERSION;
        
        /** @var object */
        this.options = extend(this.defaults, options);
        
        if (!this.options.patterns) {
            throw new Error('Patternlibrary error: you must specify the directories for patterns.');
        }

        if (!this.options.root) {
            throw new Error('Patternlibrary error: you must specify a root directory.')
        }
        if (!this.options.layouts) {
            throw new Error('Patternlibrary error: you must specify a layouts directory.')
        }
        if (!this.options.partials) {
            throw new Error('Patternlibrary error: you must specify a partials directory.')
        }

        /** @var object */
        this.layouts = {};

        /** @var object */
        this.data = {};
        
        this._init();
        
    }
    
    /**
     * initialize pattern-library object
     */
    _init ( ) {
        
        this.log('setup pattern-library');
        
        /** @var PatternlibraryDocParser */
        this.DocParser = null;

        /** @var PatternlibraryRenderer */
        this.DocRenderer = null;
        
        /** @var PatternlibraryMiddleware */
        this.Middleware = null;

        /** @var PatternlibraryFileStream */
        this.FileStream = null;

        
        /** @var PatternlibraryConfig */
        this.Config = new PatternlibraryConfig(this.options);
        
        
        this._initDestination();
        
        this._initPanini();

        /** @var Handlebars */
        this.Handlebars = this.Panini.Handlebars;
        
        this._initSupercollider();
        
    }
    
    
    
    
    /**
     * retrieve middleware instance
     * 
     * @param boolean reset force to initialize new middleware instance
     * @return PatternlibraryMiddleware
     */
    getMiddleware ( reset ) {
        
        if ( reset || (this.Middleware === null) ) {
            this.log('initialize middleware hook');
            this.Middleware = new PatternlibraryMiddleware(
                this.Config.get('plugins').middleware
            );
            this.Middleware.bind(this);
        }
        return (this.Middleware);
        
    }
    

    /**
     * reset middleware instance
     * 
     * @return Patternlibrary
     */
    resetMiddleware ( ) {
        
        this.Middleware = null;
        this.getMiddleware( true );
        return (this);
        
    }
    
    
    
    /**
     * retrieve (vinyl/gulp) file-stream instance
     * 
     * @param boolean reset force to initialize new file-stream instance
     * @return PatternlibraryFileStream
     */
    getFileStream ( reset ) {
        
        if ( reset || (this.FileStream === null) ) {
            this.log('initialize file-stream hook');
            this.FileStream = new PatternlibraryFileStream(
                this.Config.get('plugins').filestream
            );
            this.FileStream.bind(this);
        }
        return (this.FileStream);
        
    }
    

    /**
     * reset file-stream instance
     * 
     * @return Patternlibrary
     */
    resetFileStream ( ) {
        
        this.FileStream = null;
        this.getFileStream( true );
        return (this);
        
    }
    
    
    
    /**
     * retrieve doc-parser instance
     * 
     * @param boolean reset force to initialize new file-stream instance
     * @return PatternlibraryDocParser
     */
    getDocParser ( reset ) {
        
        if ( reset || (this.DocParser === null) ) {
            this.log('initialize documentaion info parser');
            this.DocParser = new PatternlibraryDocParser(
                this.Config.get('plugins').docparser
            );
            this.DocParser.bind(this);
        }
        return (this.DocParser);
        
    }
    

    /**
     * reset doc-parser instance
     * 
     * @return Patternlibrary
     */
    resetDocParser ( ) {
        
        this.DocParser = null;
        this.getDocParser( true );
        return (this);
        
    }
    
    
    
    /**
     * retrieve doc-renderer instance
     * 
     * @param boolean reset force to initialize new file-stream instance
     * @return PatternlibraryDocRenderer
     */
    getDocRenderer ( reset ) {
        
        if ( reset || (this.DocRenderer === null) ) {
            this.log('initialize documentation pages generator');
            this.DocRenderer = new PatternlibraryDocRenderer(
                this.Config.get('plugins').docrenderer
            );
            this.DocRenderer.bind(this);
        }
        return (this.DocRenderer);
        
    }
    

    /**
     * reset doc-renderer instance
     * 
     * @return Patternlibrary
     */
    resetDocRenderer ( ) {
        
        this.DocRenderer = null;
        this.getDocRenderer( true );
        return (this);
        
    }
    
    
    
    

    /**
     * generate the whole Patternlibrary data, pages and stuff...
     * 
     * @return Patternlibrary
     */
    run ( ) {
        
        try {
            // ... do stuff ^^
            
            // -> parse patterns
            this.getDocParser().parse();
            
            // -> generate docs
            this.getDocRenderer().renderDocs();
            
            // -> write data files (do separately?)
            
            // ...?!
        } catch (err) {
            this.warn(err);
            this.debug(err);
        }
        return (this);
    }
    

    
    
    

    /**
     * output warn message to console
     * 
     * @return Patternlibrary
     */
    warn ( msg, err ) {
        var strings = {
            time    : chalk.yellow( (new Date()).toLocaleTimeString() ),
            message : chalk.yellow( msg )
        };
        console.log(
            '['+(strings.time)+'] Patternlibrary: ' + (strings.message) // + "\n"
        );
        if (err) this.debug(err);
        return (this);
    }

    /**
     * output log message to console if verbose option is set to `true`
     * 
     * @return Patternlibrary
     */
    log ( msg ) {
        if (this.options.verbose === true) {
            var strings = {
                time    : chalk.grey( (new Date()).toLocaleTimeString() ),
                message : chalk.cyan( msg )
            };
            console.log(
                '['+(strings.time)+'] Patternlibrary: ' + (strings.message) // + "\n"
            );
        }
        return (this);
    }

    /**
     * output debug info to console if verbose and debug options are set to `true`
     * 
     * @return Patternlibrary
     */
    debug ( ) {
        if (this.options.verbose === true) {
            var strings = {
                time : chalk.grey( (new Date()).toLocaleTimeString() ),
                title : chalk.yellow( 'Patternlibrary Debug:' )
            };
            console.log(
                '['+(strings.time)+'] '+(strings.title)+' '+"\n",
                chalk.yellow(' >>> =================================================== <<< ') // +"\n"
            );
            for (var arg of arguments) {
                if (arg) console.log(arg);
            }
            console.log(
                chalk.yellow(' >>> =================================================== <<< ') // +"\n"
            );
        }
        return (this);
    }
    
    
    /**
     * increase usage on a given pattern by a given consumer
     * 
     * @param string patternname
     * @param object consumer
     */
    patternUsage ( patternname, consumer ) { 

        if ( typeof this.data[patternname] != 'undefined') {
            if ( typeof this.data[patternname].usage == 'undefined') {
                this.data[patternname].usage = {
                    count: 0,
                    consumers: {}
                };
                
                // increase counter
                this.data[patternname].usage.count = this.data[patternname].usage.count + 1;
                
                if (consumer && consumer.pattern) {
                    // add consumer, increase consumer counter
                    var consumerName = consumer.pattern.name;
                    if (!this.data[patternname].usage.consumers[consumerName]) {
                        this.data[patternname].usage.consumers[consumerName] = 1;
                    } else {
                        this.data[patternname].usage.consumers[consumerName] = 
                            this.data[patternname].usage.consumers[consumerName] + 1;
                    }
                }
            }    
        }
        
    }
    
    /**
     * updates the pattern-library JSON data-file
     */
    updateDataFile ( ) { 
        var patterns    = this.getPatterns();
        var categories  = this.getCategories();
        var tree        = this.Supercollider.tree;
        
        // complete library data
        var file = this.options.dest+'/patternlibrary.json';
        jsonfile.writeFileSync(file, {
            patterns  : patterns,
            categories: categories,
            tree      : tree,
        }, {spaces: 4});
        
        // search data
        this.Supercollider.options.pageRoot = this.Config.get('root');
        this.Supercollider.buildSearch(this.options.dest+'/search.json', function() {
            // file written...
        });


        // categorie data
        var file = this.options.dest+'/patterns.json';
        jsonfile.writeFileSync(file, patterns, {spaces: 4});

        // categorie data
        var file = this.options.dest+'/categories.json';
        jsonfile.writeFileSync(file, categories, {spaces: 4});

        // categorie data
        var file = this.options.dest+'/tree.json';
        jsonfile.writeFileSync(file, tree, {spaces: 4});
        
    }
    
    
    
    /**
     * refresh/reload pattern-library data
     */
    refresh ( ) { 
        
        return this.run();
        
    }
    
    
    
    /**
     * retrieve current pattern-library data
     */
    getPatterns ( type_or_category ) { 
        if (type_or_category) {
            var patterns = {};
            for (var patternkey in this.data) {
                var pattern = this.data[patternkey];
                if ( 
                    ( String(patternkey).indexOf(type_or_category) != -1 ) ||
                    ( pattern.pattern.categories && ( pattern.pattern.categories.indexOf(type_or_category) != -1 ) )
                ) {
                    patterns[patternkey] = pattern;                
                }
            }
            return patterns;
        }
        
        return this.data; 
    
    }
    
    
    
    
    /**
     * retrieve current list of pattern categories
     */
    getCategories ( ) { 
        var patterns  = this.getPatterns();

        function isCatInList ( arr, obj, idx ) {
        	for (var i in arr) {
        		if ( arr[i][idx] && obj[idx] && (arr[i][idx] == obj[idx]) ) {
        			return (true);
        		}
        	}
        	return false;
        }
        function sortByKey(array, key) {
            return array.sort(function(a, b) {
                var x = a[key]; var y = b[key];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }
        
        // categories data
        var categories = [];
        for (var pattern in patterns) {
            var patterncategories = 
                !Array.isArray(patterns[pattern].pattern.categories) ? 
                    [patterns[pattern].pattern.categories] : 
                        patterns[pattern].pattern.categories;
            for (var i in patterncategories) {
                var cat = { 
                    name: String(patterncategories[i]),
                    slug: String(patterncategories[i])
                };
                if ( !isCatInList( categories, cat, 'slug' ) ) {
                	var catPatterns = this.getPatterns(cat.slug);
                	cat.patterns = catPatterns;
                	cat.patternsCount = ((b) => {
                		var c = 0; for (var a in b) { c++; }; return c;
                	})(catPatterns);
                    categories.push(cat);
                }
            }
        }
        
        categories = sortByKey(categories, 'slug');
        return (categories);
    }
    
    
    
    
    
    //
    // helpers
    //
    
    /**
     * recursivly read a list of files from a given directory 
     * according to a given file-path pattern
     * 
     * scans relative to project root
     * 
     * @param string|[string] dir
     * @param string pattern
     * @return [string]  
     */
    _readdir ( dir, pattern ) {
        
        var files = [];

        dir = !Array.isArray(dir) ? [dir] : dir;

        for (var i in dir) {
            files = files.concat(
                glob.sync( path.join( process.cwd(), dir[i], pattern ) )
            );
        }

        return files;
        
    }
    
    /**
     * initialize destination directory
     */
    _initDestination ( ) {
        try {
            fs.ensureDirSync(this.options.dest);
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }
    }
    
    /**
     * initialize 'Panini' object
     */
    _initPanini ( ) {
        
        if (!this.Panini) {
            
            let paniniOptions = {};
            
            paniniOptions.root     = this.options.root;
            paniniOptions.layouts  = this.options.layouts;
            paniniOptions.partials = this.options.partials;
            paniniOptions.data     = this.options.data || null;
            paniniOptions.helpers  = this.options.helpers || null;
            
            this.Panini = new Panini.Panini(paniniOptions);
            this.Panini.loadBuiltinHelpers();
            
            // import Foundation Docs handlebar helpers
            this.Panini.Handlebars = require('./vendor/handlebars');

            this._registerPatternHelpers();

            
            // detect layouts, pages, data, etc...
            this.Panini.refresh();
            
        }
    }
    
    /**
     * register new Panini/Handlebars helpers
     */
    _registerPatternHelpers ( ) {
        
        // Capitalizes the first letter of a string
        this.Panini.Handlebars.registerHelper('toUpper', function(str) {
          return str[0].toUpperCase() + str.slice(1);
        });

        // Formats a mixin using a SassDoc mixin object to look like this:
        // @include mixinName($param, $param) { }
        this.Panini.Handlebars.registerHelper('writeMixin', function(mixin) {
          var name = mixin['context']['name'];
          var params = mixin['parameter'];

          var str = '@include ';
          str += name + '(';
          for (var i in params) {
            str += '$' + params[i]['name'] + ', ';
          }
          if (params) str = str.slice(0, -2);
          str += ') { }';

          return str;
        });

        // Formats a function using a SassDoc function object to look like this:
        // function($param, $param)
        this.Panini.Handlebars.registerHelper('writeFunction', function(func) {
          var name = func['context']['name'];
          var params = func['parameter'];

          var str = '';
          str += name + '(';
          for (var i in params) {
            str += '$' + params[i]['name'] + ', ';
          }
          if (params) str = str.slice(0, -2);
          str += ')';

          return str;
        });

        // Converts a Markdown string to HTML
        this.Panini.Handlebars.registerHelper('md', function(text) {
          return marked(text);
        });

        var relPath = path.relative( process.cwd(), path.join(__dirname, '') );
        // register 'local' helper stuff
        this.Panini.loadLayouts([path.join(relPath, '../layouts/'), '../layouts/','layouts',
            (this.options.layouts || 'layouts')
        ]);
        this.Panini.loadHelpers([path.join(relPath, '../helpers/'), '../helpers/', 'helpers',
            (this.options.helpers || 'helpers')
        ]);

        // special partial helper
        this.Panini.Handlebars.registerHelper('PL', require( path.join('../helpers/patternlibrary') ));
    }
    
    /**
     * initialize 'Panini' object
     */
    _initSupercollider ( ) {

        if (!this.Supercollider) {
            var $this = this;
            
            this.Supercollider       = new superCollider.Supercollider();
            this.Supercollider.$PL   = this; // Patternlibrary reference to Supercollider
            this.Supercollider.init  = require('./supercollider/supercollider_init_path_awareness');
            this.Supercollider.parse = require('./supercollider/supercollider_parse_extended');
            this.Supercollider
                //.adapter('sass')
                .adapter('js')
            ;
            this.Supercollider.adapter('sass',      require('./supercollider/adapters/sass.js'));
            this.Supercollider.adapter('source',    require('./supercollider/adapters/sourcecode.js'));
            this.Supercollider.adapter('example',   require('./supercollider/adapters/sourceexample.js'));
            this.Supercollider.adapter('specs',     require('./supercollider/adapters/patternspecs.js'));
            this.Supercollider.adapter('changelog', require('./supercollider/adapters/changelog.js'));
            this.Supercollider.adapter('gitinfo',   require('./supercollider/adapters/gitinfo.js'));
            this.Supercollider.adapter('tests',     require('./supercollider/adapters/testresults.js'));
            
            
        }
    }
    
    /**
     * determine the relative path between 2 given paths
     * 
     * @param string page
     * @param string root
     * @return string
     */
    _relativeRoot ( page, root ) {
        var pagePath = path.dirname(page);
        var rootPath = path.join(process.cwd(), root);

        var relativePath = path.relative(pagePath, rootPath);

        if (relativePath.length > 0) {
            relativePath += '/';
        }

        // On Windows, paths are separated with a "\"
        // However, web browsers use "/" no matter the platform
        return slash(relativePath);
    }
}

/**
 * pattern-library default options
 */
Patternlibrary.prototype.defaults = require('./config/default.js');

/**
 * export pattern-library object
 */
module.exports = Patternlibrary;