# (Node-)**Patternlibrary**

[![npm version](https://badge.fury.io/js/node-patternlibrary.svg)](https://badge.fury.io/js/node-patternlibrary)

[![dependencies status](https://david-dm.org/bb-drummer/node-patternlibrary.svg)](https://david-dm.org/bb-drummer/node-patternlibrary)

[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/?branch=master)
[![Build Status](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/badges/build.png?b=master)](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/build-status/master)

[![Build Status](https://travis-ci.org/bb-drummer/node-patternlibrary.svg?branch=master)](https://travis-ci.org/bb-drummer/node-patternlibrary)

### Work-In-Progress disclaimer

This project is now still a work in progress!
Some of its features and options are or may be a subject to change!

DO NOT USE IN PRODUCTION ENVIRONMENTS !

When using this software, absolutely no warranties of any sort are granted. Please see the license file for more information.

---

## About


**Patternlibrary** (a.k.a. _node-patternlibrary_) is a simple flat file documentaion generator for use with Node, Gulp or Grunt. 

It compiles a series of HTML **patterns** (a.k.a. _partials_) structured in an **atomic desing pattern**. These patterns can also include other HTML **patterns**/**partials**, external Handlebars **helpers**, or external **data** as JSON or YAML. 

Documentation pages for each pattern are created according to the specific pattern meta-data supplied. Those pages are combined under a GUI to view in your browser.

The main template engine behind this is *handlebars* ([-> homepage](http://handlebarsjs.com)) which itself is extended by *Zurb Foundation*'s *Panini* ([-> GitHub](https://github.com/zurb/panini)). The style and script source files are parsed by *Zurb Foundation*'s *Supercollider* ([-> GitHub](https://github.com/zurb/supercollider)) utilizing *SassDoc* ([-> homepage](http://sassdoc.com/)) and *JSDoc* ([-> homepage](http://usejsdoc.org)).


## Documentation


For detailed explanations of each of the parts that made up **Patternlibrary**, please see the following pages:

- [Installation and (basic) usage](https://gitlab.bjoernbartels.earth/js/patternlibrary/tree/master/docs/usage_docs.md)

- [Options](https://gitlab.bjoernbartels.earth/js/patternlibrary/tree/master/docs/options_docs.md)

- [Generating pattern documentation](https://gitlab.bjoernbartels.earth/js/patternlibrary/tree/master/docs/patternspecs_docs.md)

  To generate the pattern-specific documentation pages, some requirements must be satisfied for each pattern:

  - the [Pattern specifications](https://gitlab.bjoernbartels.earth/js/patternlibrary/tree/master/docs/patternspecs_docs.md)
  
  and...
  
  - a [`readme.md` file](https://gitlab.bjoernbartels.earth/js/patternlibrary/tree/master/docs/patternspecs_docs.md)
  
  
  Optionally, you can also apply...
  
  - [SASS reference documentation](https://gitlab.bjoernbartels.earth/js/patternlibrary/tree/master/docs/sassdoc_docs.md),
  
  - [JavaScript reference documentation](https://gitlab.bjoernbartels.earth/js/patternlibrary/tree/master/docs/jsdoc_docs.md),
  
  - a [`changelog.md` file](https://gitlab.bjoernbartels.earth/js/patternlibrary/tree/master/docs/changelog_docs.md) and
  
  - [Test files and testing](https://gitlab.bjoernbartels.earth/js/patternlibrary/tree/master/docs/testing_docs.md)
  
- [GUI usage](https://gitlab.bjoernbartels.earth/js/patternlibrary/tree/master/docs/gui_docs.md)
  
- [API documentation and advanced usage](https://gitlab.bjoernbartels.earth/js/patternlibrary/tree/master/docs/api_docs.md)
  
- [Gulp/Grunt middleware usage](https://gitlab.bjoernbartels.earth/js/patternlibrary/tree/master/docs/middleware_docs.md)



## Example project

[An example front-end/theme project](https://gitlab.bjoernbartels.earth//themes/node-patternlibrary-demo) can be found in our [GitLab](https://gitlab.bjoernbartels.earth//themes/node-patternlibrary-demo).

---

Copyright (c) 2017, [bjoernbartels.earth]

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Please, see the license file for more information.
