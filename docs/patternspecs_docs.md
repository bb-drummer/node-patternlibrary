[TOC]

---

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
Mandatory is, of course, the pattern's template file. This file must contain the 
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

## Including a pattern inside other templates

A pattern inside other (pattern) templates is included utilizing ether the default *handlebars* build-in helper `{{> "..."}}` or by using the *Patternlibrary* helper `{{PL ...}}`. 
The pattern can be referenced by its structural item path `{{> "{type}/{group}/{patternname}"}` or `{{PL {type}="{group}/{patternname}"}`, which is defined in the pattern specification's [`pattern.name`](#name) property.


Referencing when using the *handlebars* helper:
```
   {{> "atom/link"}}  and {{> "atom/nav/link"}}
```
...or using the *Patternlibrary* helper:
```
   {{PL atom="link"}}  and {{PL atom="nav/link"}}
   
   {{PL molecule="nav/topbar/navitem"}}  and {{PL molecule="nav/sub/navitem"}}
```

For more information on the *Patternlibrary* helper, please take a look at the [helpers section](#patternlibrary-helpers).


## Main pattern file: index.html

This is the actual main pattern template file. 
At its start, the file must contain a special YAML data block to identify and describe the pattern, the [*pattern specifications*](#pattern-specifications).

```
---
pattern:
  name: "{type}/{group}/{patternname}"
  categories: ["{category}", "{category}", ...]
  uses: ["{pattern-id}", "{pattern-id}", ...]
params:
  {param-name} : {allowed-value(s)}
defaults:
  {param-name} : {default-value}
---

<!-- pattern/template markup, etc... -->

```
A pattern is identified and registered using the `pattern.name`-property. So, a minimum pattern spec block is
```
---
pattern:
  name: "{type}/{group}/{patternname}"
---

<!-- pattern/template markup, etc... -->

```
After that data block, the template may contain, as usual, any content or markup demanded.

In its content/markup, the pattern itself again can, of course, include any other pattern or template registered by *handlebars* or the *Patternlibrary*.
Be beware of circular references, which may lead to unexpected results and side effects!


### Pattern specifications

This is a YAML data block in the beginning of the main pattern template file. 
The following objects and properties are recognized and processed by the *Patternlibrary*:

- #### `pattern`

  The container object for patterns-specific meta-data

  - ##### `name`
      *Type:* `String`
      **mandatory**

      Name (and type) of the pattern, according to its structural item path in the form of `{type}/({group}/){patternname}`,  i.e.: `atom/link` or `atom/nav/link`.


  - ##### `categories`

      *Type:* `[String]`, *optional*, default: []

      List of categories to apply to the pattern
      


  - ##### `uses`

      **Type:** `[String]`

      List of other patterns used, a.k.a. included, by the pattern
      _optional, default: []


- #### `params`

  **Type:** `Object`

  Set of pattern-specific parameters to apply to the pattern upon inclusion, i.e.:
  ```html
  {{> "mypattern" some_parameter="value"}}
  ```
  _optional_, default: {}


- #### `defaults`

  **Type:** `Object`

  Set of values to apply to the pattern parameters if those are omitted upon inclusion. To function correctly, these object keys must match the keys of the `params` object.
  _optional_, default: {}


### Pattern parameters

To help making a pattern more flexible and re-usable, it can provide parameters. This is a built-in feature of *handlebars* itself.
In general, when including a sub-pattern/template, a parameter may contain any value that is supported through *handlebars*.
However, the *Patternlibrary*'s pattern specifications `params` definition should restrict a parameter's value to the ones given to provide (more) detailed documentation and assist is generating test cases for the pattern.

#### Parameter formats and legend:

| format | description |
| :----- | ----------- |
| ` key: * ` | the property 'key' may contain any scalar value or nothing |
| ` key: [*] ` | the property 'key' may contain any list of scalar values or nothing |
| ` key: ['a', 'b'] ` | the property 'key' may contain only value 'a' or 'b' |


## Pattern documentation

A pattern's complete documentation, browsable in *Patternlibrary*'s GUI, is assembled from several sources. 

### The pattern and its variants

A (generic) sample output is created from the pattern's main template file. If the pattern provides parameters and also provides default values for them, those default values are substituted.

Possible combinations of parameters and their more ore less defined values are shown as a variant of the pattern. They can be selected by filling an input filed with values for ` key: *` or ` key: [*] ` parameters or selecting from its combinations of values from ` key: ['a', 'b'] ` parameters.

### Pattern file: 'readme.md'

This is the generic textual description of the pattern. 

### CSS/SCSS documentation

The pattern's CSS/SCSS documentation is gathered from its main CSS/SCSS source file `styles.scss` via [SassDoc](http://sassdoc.com/). 
 


### JavaScript documentation

The pattern's JavaScript documentation is gathered from its main script source file `index.js` or `module.js` via [JSDoc](http://usejsdoc.org). 




### Pattern tests




### Pattern log



## *Patternlibrary* helpers

Besides the *handlebars* and *Panini* built-in helpers, *Patternlibrary* provide several helpers on its own to assist creating patterns and utilizing *Patternlibrary* features.

### the "PL" helper

#### Differences between `{{>...}}` and `{{PL...}}`


...


