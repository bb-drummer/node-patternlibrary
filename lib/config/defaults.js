/**
 * Patternlibrary default configuration values
 * 
 * @var object
 */
var Patternlibrary_Defaults = {

    // userdefined templates, partials, target-dir, etc...
    //
    
    // base path to look for userdefined page templates
    "root"     : "src/pages/",
    // path to look for userdefined layout templates
    "layouts"  : "src/layouts/",
    // base path to look for userdefined pattern partials
    "partials" : "src/partials/",
    // path to look for userdefined partial data storage
    "data"     : "src/data/",
    // path to look for userdefined pattern helpers
    "helpers"  : "src/helpers/",

    // destination build-path for patternlibrary files
    "dest"     : "dist/",
    
    // base path for server request's
    "basepath" : "pl/",
    
    // pattern base path for server request's
    "patternspath" : "patterns/",
    
    // pattern base path for server request's
    "categoriespath" : "categories/",
    
    
    // Patternlibrary setup
    //
    
    // verbose console output
    "verbose"  : false,
    
    
    // pattern options 
    "pattern" : { 
        "source"     : "*.{html,hbs,handlebars}",     // {index,pattern}
        "readme"     : "{readme,info}.{md,markdown}", // "*.md",             // {readme,info}.{md,markdown}
        "javascript" : "*.js",                        // {index,module}
        "scss"       : "*.{scss,sass,css}",           // {style,styles,pattern}
        "tests"      : "{test,tests,visual,visualtest,visualtests}.js",
        "changelog"  : "changelog.{md,markdown}",
        
        // search sub-path
        "searchpath" : "**",
        
        // doc target filename
        "target"     : "index.html",

        // pattern sub-directories in "partials"
        "dirs" : {
            "atoms"     : "atoms/",
            "molecules" : "molecules/",
            "organisms" : "organisms/",
            "templates" : "tempates/",
            "pages"     : "pages/"
        }
    },
    
    "gui": {
    	
    	
        // base path to look for userdefined page templates
        "pages"            : "gui/src/pages/",
        
        // path to look for userdefined layout templates
        "layouts"          : "gui/src/layouts/",
        
        // base path to look for userdefined pattern partials
        "partials"         : "gui/src/partials/",
        
        
        
        // Patternlibrary page layout name (file basename)
        "layout"           : "patternlibrary",

        // Patternlibrary pattern doc page template filename
        "docpage"          : "patterndocs.html", // 
        
        // Patternlibrary dashboard template filename
        "dashboard"        : "dashboard.html",
        
        // Patternlibrary pattern list page template filename
        "patternlist"      : "index.html",
        
        // Patternlibrary pattern list page template filename
        "categorylist"     : "categories/index.html",

    },
    "nogui": false,
    
    "templates": {
        
        // Patternlibrary page layout file
        "layout"           : "patternlibrary",

        // Patternlibrary pattern doc page template
        "docpage"          : "patterndocs.html", // 
        
        // Patternlibrary dashboard template
        "dashboard"        : "dashboard.html",
        
        // Patternlibrary pattern list page template
        "patternlist"      : "index.html",
        
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
    
    // internal Supercollider options
    "adapters" : {
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