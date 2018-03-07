---
layout: patternlibrary
---

# Patternlibrary - Options and configuration



[[TOC]]




---



## Configuration


on instanciation :

```js
const PL = new Patternlibrary(options);
```


with `config` method: 

```js
const PL = new Patternlibrary();

// ...

PL.config(options);
```


on initialisation : 

```js
const PL = new Patternlibrary();

// ...

PL.run(options);
```


section in `package.json` file: 

```js
{
  "name": "my-package",
  "version": "1.2.3",

  // ...
  
  "patternlibrary": {
  
    "root"    : "src/pages",
    "partials": "src/components",
    
    // ...

  }

}

```


a separate `.patternlibrary.rc` file in your project root: 

```js
{
  "root"    : "src/pages",
  "partials": "src/components",

  // ...

}

```



---



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


- #### `verbose`

  **Type:** `Boolean`

  Create verbose console output.   
  _optional_, default: false
  

- - - - - - - - - - - - - - - - - - - - - - - -


### Special options


- #### `patterns`

  **Type:** `Object`

  Set the pattern specific source-paths.   
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
  
  search sub-path under 'partials' path
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


### Middleware options


- #### `middleware`

  **Type:** `Object`

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

- #### `markdown`

  **Type:** `Object`

  Set 'markdown-it' options.

- #### `sassdoc`

  **Type:** `Object`

  Set 'sassdoc' options.

- #### `jsdoc`

  **Type:** `Object`

  Set 'jsdoc' options.


---

