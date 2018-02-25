/**
 * Patternlibrary default configuration values
 * 
 * @var object
 */
var Patternlibrary_Defaults = {

    // userdefined templates, partials, etc...
    //
    
    // base path to look for userdefined page templates
    "root"     : "src/pages/",
    // path to look for userdefined layout templates
    "layouts"  : "src/layouts/",
    // base path to look for userdefined pattern partials
    "partials" : "src/patterns/",
    // path to look for userdefined partial data storage
    "data"     : "src/data/",
    // path to look for userdefined pattern helpers
    "helpers"  : "src/helpers/",

    // destination build-path for patternlibrary files
    "dest"     : "_build/patternlibrary/",
    
    // base path for server request's middleware hook
    "basepath" : "/patternlibrary",
    
    
    // Patternlibrary setup
    //
    
    // verbose console output
    "verbose"  : false,
    
    // pattern sub-directories in "partials"
    "patterns" : {
        "atoms"     : "atoms/",
        "molecules" : "molecules/",
        "organisms" : "organisms/",
        "templates" : "tempates/"
    },
    // pattern filenames to look up 
    "patternfilenames" : { 
        //"main"       : "{index,pattern}.{html,hbs,handlebars}",
        "main"       : "*.{html,hbs,handlebars}",
        "readme"     : "{readme,info}.{md,markdown}",
        "markup"     : "{example,examples}.{md,markdown}",
        "javascript" : "{index,module}.js",
        "scss"       : "{style,styles,pattern}.{scss,sass,css}",
        "tests"      : "{test,tests,visual,visualtest,visualtests}.js",
        "changelog"  : "changelog.{md,markdown}"
     },
    // search sub-path
    "patternsearchpath" : "*/**/",
    
    "templates": {
        
        // Patternlibrary helpers path
        "helpers"          : "helpers/",
        
        // Patternlibrary layout file
        "layout"           : "template", // "layout"        : "layouts/patternlibrary.html", // 
          
        
        // Patternlibrary partials templates
        //

        // Patternlibrary main page template
        "page"             : "patternlibrary", // "page"          : "templates/patternlibrary-page.html", // 
        
        // main index page template
        "mainindex"        : "templates/index.html",
        
        // pattern list template
        "patternlist"      : "templates/patternlist.html",
        // pattern display template
        "patterndisplay"   : "templates/patterndisplay.html", 
 
        // pattern main index page template
        "patternindex"     : "templates/pattern-index.html", 
        // pattern readme display template
        "patternreadme"    : "templates/patterndisplay-readme.html", 
        // pattern markup display template
        "patternmarkup"    : "templates/patterndisplay-markup.html", 
        // pattern javascript display template
        "patternjavascript": "templates/patterndisplay-javascript.html", 
        // pattern scss display template
        "patternscss"      : "templates/patterndisplay-scss.html", 
        // pattern template-file display template
        "patterntemplate"  : "templates/patterndisplay-template.html", 
        // pattern tests display template
        "patterntests"     : "templates/patterndisplay-tests.html", 
        // pattern changelog display template
        "patternchangelog" : "templates/patterndisplay-changelog.html", 
        
        // page list template
        "pagelist"         : "templates/pagelist.html",
        // page display template
        "pagedisplay"      : "templates/pagedisplay.html" 
    },
    

    // advanced setup
    
    // internal look-up paths for Patternlibrary includes and templates, partials, etc... 
    "fileLookupPath" : [
        "./",
        "node_modules/node-patternlibrary/"
    ],

    // internal Panini/Handlebars options
    "panini" : {
    },

    // internal MarkDown options
    "marked" : {
    },

    // internal Supercollider options
    "supercollider" : {
    },
    
    
    // (internal) plugin setups
    "plugins" : {

        // internal doc-parser options
        "docparser" : {
        },
    
        // internal template renderer options
        "docrenderer" : {
        },

        // internal middleware options
        "filestream" : {
        },
    
        // internal middleware options
        "middleware" : {
        }
        
    }
    
};

module.exports = Patternlibrary_Defaults;