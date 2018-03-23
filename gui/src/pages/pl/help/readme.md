---
layout: patternlibrary
---

# (Node-)**Patternlibrary**

[![npm version](https://badge.fury.io/js/node-patternlibrary.svg)](https://badge.fury.io/js/node-patternlibrary)

[![dependencies status](https://david-dm.org/bb-drummer/node-patternlibrary.svg)](https://david-dm.org/bb-drummer/node-patternlibrary)

[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/?branch=master)
[![Build Status](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/badges/build.png?b=master)](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/build-status/master)

[![Build Status](https://travis-ci.org/bb-drummer/node-patternlibrary.svg?branch=master)](https://travis-ci.org/bb-drummer/node-patternlibrary)


---


## About


**Patternlibrary** (@ npm: _node-patternlibrary_) is a pattern/component documentation and static site generator for use with Node-JS. 

It generates a series of documentation pages for each of the HTML **patterns**, or _partials_, or _components_, structured in an **atomic design pattern**.
Documentation details are assembled from the specific pattern-files's source codes and supplied meta-data. 
Of course, like any other (Handlebars) partial, those patterns can also include other patterns, external (Handlebars) helpers or data as JSON or YAML, by themselfs.

These pages are combined under a GUI to view in your browser. It provides an overview dashboard, lists to browse patterns and categories and (kind of) interactive pattern documentation.

The template engine used is [*Handlebars*](http://handlebarsjs.com) and rendering _markdown_ is accomplished with [*MarkdownIt*](https://github.com/markdown-it/markdown-it). Parsing the style and script source files is utilizing ([*SassDoc*](http://sassdoc.com/)) and ([*JSDoc*](http://usejsdoc.org)).


## Live-Demo


A live demonstration of a **Patternlibrary** GUI build can be found at [demo.patternlibrary.net](https://demo.patternlibrary.net)


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


### Work-In-Progress disclaimer

This project is now going from some kind of *Proof Of Concept* to real-life implementation.
Most of its behavour and features are fixed for now.

When using this software, absolutely no warranties of any sort are granted. Please see the license file for more information.


---


Copyright (c) 2017, [bjoernbartels.earth]

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Please, see the license file for more information.
