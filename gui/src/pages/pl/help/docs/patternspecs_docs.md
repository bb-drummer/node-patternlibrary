---
layout: patternlibrary
---

*   [Generating the library and pattern documentation](#generating-the-library-and-pattern-documentation) 
    *   [Pattern files and folders](#pattern-files-and-folders)
    *   [Including a pattern inside other templates](#including-a-pattern-inside-other-templates)
    *   [Main pattern file: index.html](#main-pattern-file-indexhtml) 
        *   [Pattern specifications](#pattern-specifications)
            *   [pattern](#pattern)
            *   [params](#params)
            *   [defaults](#defaults)
        *   [Pattern parameters](#pattern-parameters)
            *   [Parameter formats and legend:](#parameter-formats-and-legend)
    *   [Pattern documentation](#pattern-documentation)
        *   [The pattern and its variants](#the-pattern-and-its-variants)
        *   [Pattern file: ‘readme.md’](#pattern-file-readmemd)
        *   [CSS/SCSS documentation](#cssscss-documentation)
        *   [JavaScript documentation](#javascript-documentation)
        *   [Pattern tests](#pattern-tests)
        *   [Pattern log](#pattern-log)
    *   [Patternlibrary helpers](#patternlibrary-helpers)
        *   [the “PL” helper](#the-pl-helper)
            *   [Including a pattern using the default {{>...}}](#including-a-pattern-using-the-default-)
            *   [Differences between {{>...}} and {{PL...}}](#differences-between-and-pl) (!)
        *   [the “texthelper”](#the-texthelper)
            *   [“texthelper” modes](#texthelper-modes)
        *   [the “uniqueid” helper](#the-uniqueid-helper)
            *   [“uniqueid” examples](#uniqueid-examples)
        *   [the “raw” helper](#the-raw-helper)
        *   [the “categorylink” helper](#the-categorylink-helper) (internal)
        *   [the “patternlink” helper](#the-patternlink-helper) (internal)


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
The pattern can be referenced by its structural item path `{{> "{type}/{group}/{patternname}"}}` or `{{PL type="{group}/{patternname}"}}`, which is defined in the pattern specification's [`pattern.name`](#name) property.


Referencing when using the *handlebars* helper:
```
{{> "atom/link"}}  or {{> "atom/nav/link"}}
```
...or using the *Patternlibrary* helper:
```
{{PL atom="link"}}  or {{PL atom="nav/link"}}
   
{{PL molecule="nav/topbar/navitem"}}  or {{PL molecule="nav/sub/navitem"}}
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
    *Type:* `[String]`
    *optional*, default: []

    List of categories to apply to the pattern
      


  - ##### `uses`
      *Type:* `[String]`
      *optional*, default: []
      
      List of other patterns used, a.k.a. included, by the pattern


- #### `params`
    *Type:* `Object`
    *optional*, default: {}
    
    Set of pattern-specific parameters to apply to the pattern upon inclusion, i.e.:
    ```html
    {{> "mypattern" some_parameter="value"}}
    ```


- #### `defaults`
    *Type:* `Object`
    *optional*, default: {}

    Set of values to apply to the pattern parameters if those are omitted upon inclusion. To function correctly, these object keys must match the keys of the `params` object.


### Pattern parameters

To help making a pattern more flexible and re-usable, it can provide parameters. This is a built-in feature of *handlebars* itself.
In general, when including a sub-pattern/template, a parameter may contain any value that is supported through *handlebars*.

However, the *Patternlibrary*'s pattern specifications `params` definition should restrict a parameter's value to the ones given to provide (more) detailed documentation and assist is generating test cases for the pattern. 
Additionally and more importantly, the *Patternlibrary* performs a check of the submitted values against the requirements of the parameter on sub-pattern inclusion using the ["**`PL`**" helper](#the-pl-helper). 
If a value does not match the requirement, an optionally given [default value](#pattern-parameter-defaults) is substituted and a warning thrown to console output if available.

#### Parameter describing syntax:

The generic format of a pattern's parameter description in the `params` section, aka YAML object, follows a simple syntax:

| format | description |
| :----- | ----------- |
| ` key: '*' ` | the parameter 'key' may contain any scalar value |
| ` key: '[*]' ` | the parameter 'key' may contain any list of scalar values |
| ` key: '[a, b...]' ` | the parameter 'key' may contain only value 'a' or 'b' and so on


#### Pattern parameter defaults

The `defaults` section/YAML object defines the corresponding default values for a parameter. Its value is substituted if an invalid parameter value is submitted on inclusion.

The simple syntax for a parameter's default value is

| format | description |
| :----- | ----------- |
| ` key: 'my value' ` | set the parameter to the string 'my value' | 



## Pattern documentation

A pattern's complete documentation, browsable in *Patternlibrary*'s GUI, is assembled from several sources. 

### The pattern and its variants

A (generic) sample output is created from the pattern's main template file. If the pattern provides parameters and also provides default values for them, those default values are substituted.

Possible combinations of parameters and their more or less defined values are shown as a variant of the pattern. They can be selected by filling an input filed with values for ` key: *` or ` key: [*] ` parameters or selecting from its combinations of values from ` key: ['a', 'b'] ` parameters.

### Pattern file: 'readme.md'

This is the generic textual description of the pattern. Using the *markdown* syntax, it may contain anything you like. Explain the purpose and the behavior of the pattern and its parameters. If applicable, describe the pattern's variants. Point out context, the quirks and pit-falls. 

Include code examples by using *markdown*'s back-tick syntax 
``` \`\`\` ... \`\`\`  ```
In case, apply syntax highlighting to it 
``` \`\`\`html ... \`\`\`  ``` or ``` \`\`\`javascript ... \`\`\`  ```
A special one is...
``` \`\`\`html_example ... \`\`\`  ```
...which outputs highlighted HTML source code along with that same code into an example output section.

### CSS/SCSS documentation

The pattern's CSS/SCSS documentation is gathered from its main CSS/SCSS source file `styles.scss` via *SassDoc* ([-> homepage](http://sassdoc.com/)). The *Patternlibrary* processes information about variables, mixins and functions as they are described in the source file.
 
Please, see the [`docs/sassdoc_docs.md`](docs/sassdoc_docs.md) file for more information and detailed examples.

### JavaScript documentation

The pattern's JavaScript documentation is gathered from its main script source file `index.js` or `module.js` via *JSDoc* ([-> homepage](http://usejsdoc.org)). The *Patternlibrary* processes information about the module, classes ond objects, as well as their properties, methods and events, as they are described in the source file.
 
Please, see the [`docs/jsdoc_docs.md`](docs/jsdoc_docs.md) file for more information and detailed examples on creating JavaScript Components and documentation.


### Pattern tests 

[@TODO]
Front-end and JavaScript tests can be stored and imported into the pattern's `test.js` file. The tests are utilizing the *Mocha* unit testing framework. Results and browser tests will be assembled for display.

Please, see the [`docs/testing_docs.md`](docs/testing_docs.md) file for more information and detailed examples on testing a pattern.
 

### Pattern log

A pattern's evolution information can be gathered from two sources. 
A `changelog.md` file can be included with every pattern. It will be displayed as it is, wether it just includes an ordered list of change entries or much more expressive prose.
Secondly, if available, the current git history is rendered for display in chronological order.


## *Patternlibrary* helpers

In addition to the built-in *handlebars* and *Panini* helpers, *Patternlibrary* provide several helpers on its own to assist creating patterns and utilizing *Patternlibrary* features.


### The "PL" helper

The *Patternlibrary* helper "**`PL`**" is your *swiss army knife* for interacting with the *Patternlibrary*.

Essentially, it started out as a wrapper around *handlebars*/*panini*'s "**`>` **" helper limitations. Therefor its main functionality is to include some sub-pattern into another pattern.
So, a simple call like
```
{{PL atom="link"}}  or {{PL atom="nav/link"}}
```
obviously includes an *atom* `link`, respectivly an *atom* `nav/link`.
Accordingly, include a *molecule* via
```
{{PL molecule="nav/topbar/navitem"}}  or {{PL molecule="nav/sub/navitem"}}
```
and an *organism* via
```
{{PL organism="content/article-panel"}}
```

As well as with the default *handlebars* helper, the "**`PL`**"  helper also accepts *parameters*. Those parameters may, but do not have to, be defined in the pattern template file's `params` and `defaults` section, [please see above](#pattern-parameters).


#### Syntax

The generic syntax for the helper is
```
{{PL {atom|molecule|organism}="path/to/pattern" [param1="val1" [param2="val2" ...[paramN="valN"]]] }}
```


#### Including a pattern using the default `{{>...}}` 

Since all patterns are registered to *handlebars*/*panini*'s default partial repository, of cause, it is possible to include a pattern using the default *handlebars* helper The pattern has to be referenced by its full structural item path, meaning: the path starting with the pattern's type:
```
{{> "atom/link"}}  and {{> "atom/nav/link"}}
```
**An important part is, you will have to wrap the pattern's path in quotes " !**



#### Differences between `{{>...}}` and `{{PL...}}` (!)

Using the  "**`PL`**"  helper, some internal operations take place when incuding a sub-pattern:

  -  **dependencies**: internally dependency info is collected and usage stats for the patterns are stored
  -  **parameter checks**: checks if the given parameters match the requirements defined in the pattern template file's `params` and `defaults` section

*The consequence is*: 
if you instead chose to use the default  "**`>`**"  helper, those operations do not take place, obviously. 
But therefore, some functions and/or behavior of the *Patternlibrary* may differ from what might be expected, for example: a pattern's GUI specifications page shows incorrect dependency information, or a sub-pattern may return unexpected results due to invalid parameter values.


### The "texthelper"

This helper outputs consistent demo texts for a given 'type', aka. `mode`. Please, see below for the list of [texthelper modes](#texthelper-modes).


#### Syntax

The generic syntax for the helper is
```
{{texthelper [mode="..."] }}
```


#### 'texthelper' modes

Currently, the helper provides the following modes and corresponding text values:

| `mode` | text output |
| :----- | :---------- |
| | | 
| // product | | 
| 'product-name' | 'An Awesome Product Name' |
| 'product-id' | '98765-432109' |
| 'product-ean' | '987-65432-109-8' |
| | | 
| // contact | | 
| 'name' | 'Marianne Mustermann' |
| 'name-rev' | 'Mustermann, Marianne' |
| 'prename' | 'Marianne' |
| 'lastname' | 'Mustermann' |
| 'street' | 'Musterstraße' |
| 'housenumber' | '12a' |
| 'streetnr' | 'Musterstraße 12a' |
| 'zipcode' | '12345' |
| 'city' | 'Musterstadt' |
| 'zipcity' | '12345 Musterstadt' |
| 'cityzip' | 'Musterstadt, 12345' |
| 'country' | 'Deutschland' |
| 'iso' | 'DE' |
| 'phone' | '+49 1234 5678-9012' |
| 'email' | 'contact@example.com' |
| 'url' | 'https://www.example.com' |
| 'social' | '@twitter_user' |
| | | 
| // date/time | | 
| 'time' | '13:54h' |
| 'date' | '12.06.2017' |
| 'date-long' | '12. Juni 2017' |
| | | 
|  // text | | 
| 'word' | 'Loremipsum' |
| 'word-dashed' | 'Lorem-ipsum' |
| 'words' | 'Lorem ipsum dolor sit amet' |
| 'normal' | 'Lorem ipsum' text with 50 words |
| 'long' | 'Lorem ipsum' text with 100 words |
| 'xlong' | 'Lorem ipsum' text with 200 words |
| 'short' |  |
| default | 'Lorem ipsum' text with 25 words |




### The "uniqueid" helper

Calling this helper generates a random unique ID string like `uid-46ea-807b` and can remember it for later use.

If you only want to create an id, just call the helper without any parameters, for example:
```html
  <section id="{{uniqueid}}" ...
```
simply outputs
```html
  <section id="uid-46ea-807b" ...
```
and the next time `{{uniqueid}}` is called, a new new id string will be put out.


#### Re-using an id throughout the project

If you also want to later re-use the id in your templates, just add a name string as its parameter.
Imagine some markup of a widget, like
```html
  <div id="{{uniqueid 'cool_widget'}}" ...
```
which also just will output
```html
  <div id="uid-1a2-c3c4" ...
```
but, additionally, it keeps the name and the id in memory.
Now, assume there is some other widget which is required to reference to the previous widget by its id. Simply re-calling the helper with the name
```html
  <div class="another widget" data-ref="{{uniqueid 'cool_widget'}}" ...
```
will remember the id and output
```html
  <div class="another widget" data-ref="uid-1a2-c3c4" ...
```


#### Syntax

The generic syntax for the helper is
```
{{uniqueid ["{id-name}"] }}
```



### The "raw" helper

This helper has an open- and close-tag and prevents its content from further being processed by the template engine, for example, to output template source code or source code examples.
```html
  <code>
  {{#raw}}
      <!-- some template example... -->
      ... {{> subpartial}}      
  {{/raw}}
  </code>
```
will simply re-output
```html
  <code>
      <!-- some template example... -->
      ... {{> subpartial}} 
  </code>
```
instead of including the `subpartial` template.


#### Syntax

The generic syntax for the helper is
```html
{{#raw}}
      {...the content
         to be left un-rendered...}
{{/raw}}
```



### The "categorylink" helper

 (internal)

...




### The "patternlink" helper

 (internal)

...

