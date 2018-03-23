
# **Patternlibrary**



[![npm version](https://badge.fury.io/js/node-patternlibrary.svg)](https://badge.fury.io/js/node-patternlibrary "npm version")
[![dependencies status](https://david-dm.org/bb-drummer/node-patternlibrary.svg)](https://david-dm.org/bb-drummer/node-patternlibrary "dependencies status")
[![Scrutinizer-CI code quality score](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/?branch=master "Scrutinizer-CI code quality score")
[![Scrutinizer-CI build status](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/badges/build.png?b=master)](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/build-status/master "Scrutinizer-CI build status")
[![Travis-CI build status](https://travis-ci.org/bb-drummer/node-patternlibrary.svg?branch=master)](https://travis-ci.org/bb-drummer/node-patternlibrary "Travis-CI build status")



---



## Welcome to the **Patternlibrary** demo



**Patternlibrary** (@ npm: _node-patternlibrary_) is a pattern/component documentation and static site generator for use with Node-JS. 

It generates a series of documentation pages for each of the HTML **patterns**, or _partials_, or _components_, structured in an **atomic design pattern**.
Documentation details are assembled from the specific pattern-files's source codes and supplied meta-data. 
Of course, like any other (Handlebars) partial, those patterns can also include other patterns, external (Handlebars) helpers or data as JSON or YAML, by themselfs.

These pages are combined under a GUI to view in your browser. It provides an overview dashboard, lists to browse patterns and categories and (kind of) interactive pattern documentation.

The template engine used is [*Handlebars*](http://handlebarsjs.com) and rendering _markdown_ is accomplished with [*MarkdownIt*](https://github.com/markdown-it/markdown-it). Parsing the style and script source files is utilizing ([*SassDoc*](http://sassdoc.com/)) and ([*JSDoc*](http://usejsdoc.org)).



### 3,... 2,... 1...



The main **Patternlibrary** GUI entrance page is

> [**The Dashboard**](./pl/)

which can also be accessed by clicking the \[title/logo\] in the upper left corner.



It may be appropriate, but it is not mandatory, to put an introductory page like this up on the front of the pattern-library for a possible consumer, maybe a plugin or an application's (micro)service developer, to get to know what she/he is going to find here and/or what that project is about.


## Documentation



[**The help pages**](./pl/help/docs/) provide detailed explanations on how to install and use **Patternlibrary**.



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


---



