# **Patternlibrary**



[![npm version](https://badge.fury.io/js/node-patternlibrary.svg)](https://badge.fury.io/js/node-patternlibrary "npm version")
[![dependencies status](https://david-dm.org/bb-drummer/node-patternlibrary.svg)](https://david-dm.org/bb-drummer/node-patternlibrary "dependencies status")
[![Scrutinizer-CI code quality score](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/?branch=master "Scrutinizer-CI code quality score")
[![Scrutinizer-CI build status](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/badges/build.png?b=master)](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/build-status/master "Scrutinizer-CI build status")
[![Travis-CI build status](https://travis-ci.org/bb-drummer/node-patternlibrary.svg?branch=master)](https://travis-ci.org/bb-drummer/node-patternlibrary "Travis-CI build status")



---



## About



**Patternlibrary** (@ npm: _node-patternlibrary_) is a static site and pattern/component documentation generator for use with Node, Gulp or Grunt. 

It compiles a series of HTML **patterns**, or _partials_, or _components_, structured in an **atomic desing pattern**. These patterns can also include other **patterns**, external Handlebars **helpers**, or external **data** as JSON or YAML. 

Documentation pages for each pattern are created according to the specific pattern meta-data supplied. Those pages are combined under a GUI to view in your browser.

The GUI provides an overview dashboard, lists to browse patterns and categories and (kind of) interactive pattern documentation.

The template engine used is [*Handlebars*](http://handlebarsjs.com) and rendering _markdown_ is accomplished with [*MarkdownIt*](https://github.com/markdown-it/markdown-it). Parsing the style and script source files is utilizing ([*SassDoc*](http://sassdoc.com/)) and ([*JSDoc*](http://usejsdoc.org)).



## Documentation



For detailed explanations of each of the parts that made up **Patternlibrary**, please see the following pages:

- [Installation and (basic) usage](gui/src/pages/pl/help/docs/usage.md)

- [Options](gui/src/pages/pl/help/docs/options.md)

- [Generating pattern documentation](gui/src/pages/pl/help/docs/patternspecs.md)

  To generate the pattern-specific documentation pages, some requirements must be satisfied for each pattern:

  - the [Pattern specifications](gui/src/pages/pl/help/docs/patternspecs.md)
  
  
  Optionally, you can also apply...
  
  - [SASS reference documentation](gui/src/pages/pl/help/docs/sassdoc.md),
  
  - [JavaScript reference documentation](gui/src/pages/pl/help/docs/jsdoc.md),
  
  - a [`changelog.md` file](gui/src/pages/pl/help/docs/changelog.md) and
  
  - [Test files and testing](gui/src/pages/pl/help/docs/testing.md)
  
- [Building static pages](gui/src/pages/pl/help/docs/staticpages.md)
  
- [GUI usage](gui/src/pages/pl/help/docs/gui.md)
  
- [API documentation and advanced usage](gui/src/pages/pl/help/docs/api.md)
  
- [Gulp/Grunt middleware usage](gui/src/pages/pl/help/docs/middleware.md)



## Example project



[An example front-end/theme project](https://gitlab.bjoernbartels.earth//themes/node-patternlibrary-demo) can be found in our [GitLab](https://gitlab.bjoernbartels.earth//themes/node-patternlibrary-demo).



---



### Work-In-Progress disclaimer

This project is now going from some kind of *Proof Of Concept* to real implementation.
Most of its features and behavour is fixed so far.

DO NOT USE IN PRODUCTION ENVIRONMENTS YET!

When using this software, absolutely no warranties of any sort are granted. Please see the license file for more information.



---



Copyright (c) 2017, [bjoernbartels.earth]

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Please, see the license file for more information.


---



