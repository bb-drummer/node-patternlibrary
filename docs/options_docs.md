## Options

For a reference of all options applied, you can also take a look at the `lib/config/defaults.js` file inside **Patternlibrary**'s source/module folder.


### Basics

This basic set of options is similar to the one set for the 'Panini' module used by the 'Zurb Foundation' project.

- #### `dest`

  **Type:** `String`

  Set the destination path where to put the generated files.   
  **mandatory**


- #### `partials`

  **Type:** `String`

  Set the 'partials' source path. Your patterns should bo found in there or it's sub-folders.   
  _optional_, default: `src/patterns`


- #### `root`

  **Type:** `String`

  Set the "root" 'pages' source path.   
  _optional_, default: `src/pages`


- #### `layouts`

  **Type:** `String`

  Set the 'layouts' source path.   
  _optional_, default: `src/layouts`


- #### `data`

  **Type:** `String`

  Set the path from where to read JSON or YAML data files   
  _optional_, default: `src/data`


- - - - - - - - - - - - - - - - - - - - - - - -


### Special options


- #### `verbose`

  **Type:** `Boolean`

  Create verbose console output.   
  _optional_, default: false
  

- #### `patterns`

  **Type:** `Object`

  Set the pattern specific sub-paths relative to the `partials` path.  
  _optional_, default: 
  ```js
{
    atoms     : 'atoms/',
    molecules : 'molecules/',
    organisms : 'organisms/',
    templates : 'tempates/'
}
  ```


- #### `patternfilenames`

  **Type:** `Object`

  Set the pattern specific file-name patterns.   
  _optional_, default: 
  ```js
{
    'main'       : '{index,pattern}.{html,hbs,handlebars}',
    'readme'     : '{readme,info}.{md,markdown}',
    'markup'     : '{example,examples}.{md,markdown}',
    'javascript' : '{index,module}.js',
    'scss'       : '{style,styles,pattern}.{scss,sass,css}',
    'tests'      : '{test,tests,visual,visualtest,visualtests}.js',
    'changelog'  : 'changelog.{md,markdown}'
}
  ```


- #### `patternsearchpath`

  **Type:** `String`
  
  Set the sub-path search-pattern under 'partials'-path to find the patterns.
  _optional_, default: '*/**/',
    

- #### `templates`

  **Type:** `Object`
  
  Set template files and template options
  ```js
    {
        // Patternlibrary helpers path
        'helpers'          : 'helpers/',
        
        // Patternlibrary layout file
        'layout'           : 'patternlibrary',
          
        
        // Patternlibrary partials templates
        //

        // Patternlibrary main page template
        'page'             : 'patternlibrary',
        
        // main index page template
        'mainindex'        : 'templates/index.html',
        
        // pattern list template
        'patternlist'      : 'templates/patternlist.html',
        // pattern display template
        'patterndisplay'   : 'templates/patterndisplay.html', 
 
        // pattern main index page template
        'patternindex'     : 'templates/pattern-index.html', 
        // pattern readme display template
        'patternreadme'    : 'templates/patterndisplay-readme.html', 
        // pattern markup display template
        'patternmarkup'    : 'templates/patterndisplay-markup.html', 
        // pattern javascript display template
        'patternjavascript': 'templates/patterndisplay-javascript.html', 
        // pattern scss display template
        'patternscss'      : 'templates/patterndisplay-scss.html', 
        // pattern template-file display template
        'patterntemplate'  : 'templates/patterndisplay-template.html', 
        // pattern tests display template
        'patterntests'     : 'templates/patterndisplay-tests.html', 
        // pattern changelog display template
        'patternchangelog' : 'templates/patterndisplay-changelog.html', 
        
        // page list template
        'pagelist'         : 'templates/pagelist.html',
        // page display template
        'pagedisplay'      : 'templates/pagedisplay.html' 
    }
  ```


- - - - - - - - - - - - - - - - - - - - - - - -


### Plug-in options


- #### `plugins`

  **Type:** `Object`

  - `docparser`

      **Type:** `Object`

      Set special 'DocParser' options
      _optional_

  - `docrenderer`

      **Type:** `Object`

      Set special 'DocRenderer' options
      _optional_

  - `filestream`

      **Type:** `Object`

      Set special 'filestream' options
      _optional_

  - `middleware`

      **Type:** `Object`

      Set special 'middleware' options
      _optional_



- - - - - - - - - - - - - - - - - - - - - - - -


### Sub-modules' options

You can also set some module specific options.   
**But use them with caution!** They strongly influence **Patternlibrary**'s functionality. 
Some really critical options are overruled by hard-coded settings.

- #### `handlebars`

  **Type:** `Object`

  Set 'handlebars' options.

- #### `panini`

  **Type:** `Object`

  Set 'panini' options.

- #### `supercollider`

  **Type:** `Object`

  Set 'supercollider' options.

- #### `marked`

  **Type:** `Object`

  Set 'marked' options.

- #### `sassdoc`

  **Type:** `Object`

  Set 'sassdoc' options.

- #### `jsdoc`

  **Type:** `Object`

  Set 'jsdoc' options.



