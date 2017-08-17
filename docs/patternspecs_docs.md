# Generating the library and pattern documentation


## Pattern files and folders

For automatic generation of the *Patternlibrary* the pattern templates will have to be set up according to a simple folder and file structure.

The main folders are:
```
{partials-dir}/
   |
   |- atoms/
   |- molecules/
   |- organisms/
```

The pattern files are stored in the pattern's type sub-folder:
```
{partials-dir}/
   |
   |- {type}/
     |- {patternname}/
```
Multiple patterns can be grouped in intermediate sub-folders:
```
{partials-dir}/
   |
   |- {type}/
     |- {group}/
       |- {patternname}/
```
When including a pattern inside pattern templates ( `{{> "..."}}` or `{{PL ...}}` ), the pattern can be referenced by its structural item path `{{> "{type}/{group}/{patternname}"}` or using the *Patternlibrary* helper `{{PL {type}="{group}/{patternname}"}`.

Example folder structure:
```
{partials-dir}/
   |
   |- atoms/
   |  |- link/
   |  |- nav/
   |    |- link/
   |   ...
   |
   |- molecules/
      |- nav/
        |- topbar/
          |- navitem/
        |- sub/
          |- navitem/

  . . .
```

The pattern files are stored inside the pattern's sub-folder.
Mandatory is, of course, the pattern's template file...
```
{partials-dir}/
   |
   |- {type}/
     |- {group}/
       |- {patternname}/
         - 'index.html'
```
 To provide more detailed information you may include
```  
         - 'readme.md' = a description, examples...
         - 'changelog.md' = log file of changes
```  
The main CSS/SASS file is
```  
         - 'styles.scss'
```
The main JavaScript file is
```  
         - 'index.js' or 'module.js'
```  
You can also provide test files, optionally grouped inside a sub-folder 
```  
          - test/
             - 'test.js'
```  

Example pattern files structure:
```
{partials-dir}/
   |
   |- atoms/
   |  |- nav/
   |    |- link/
   |      - 'index.html'
   |      - 'styles.scss'
   |      - 'readme.md'
   |      - 'changelog.md'
   |      - 'test.js'
   |
   |   ...
   |
  . . .
  
```



Referencing when using the *handlebars* helper:
```
   {{> "atom/link"}}  and {{> "atom/nav/link"}}
```
...or using the *Patternlibrary* helper:
```
   {{PL atom="link"}}  and {{PL atom="nav/link"}}
   
   {{PL molecule="nav/topbar/navitem"}}  and {{PL molecule="nav/sub/navitem"}}
```





## Pattern specifications


- ### `pattern`

  The container object for patterns-specific meta-data

  - #### `name`

      **Type:** `String`

      Name (and type) of the pattern, according to its structural item path in the form of `{type}/({group}/){patternname}`,  i.e.: `atom/link` or `atom/nav/link`
     ! **mandatory**


  - #### `categories`

      **Type:** `[String]`

      List of categories to apply to the pattern
      _optional, default: []


  - #### `uses`

      **Type:** `[String]`

      List of other patterns used, a.k.a. included, by the pattern
      _optional, default: []


- ### `params`

  **Type:** `Object`

  Set of pattern-specific parameters to apply to the pattern upon inclusion, i.e.:
  ```html
  {{> "mypattern" some_parameter="value"}}
  ```
  _optional_, default: {}


- ### `defaults`

  **Type:** `Object`

  Set of values to apply to the pattern parameters if those are omitted upon inclusion. To function correctly, these object keys must match the keys of the `params` object.
  _optional_, default: {}



## Patternfile: readme.md

...



