---
layout: patternlibrary
---

# **Patternlibrary**



[![npm version](https://badge.fury.io/js/node-patternlibrary.svg)](https://badge.fury.io/js/node-patternlibrary "npm version")
[![dependencies status](https://david-dm.org/bb-drummer/node-patternlibrary.svg)](https://david-dm.org/bb-drummer/node-patternlibrary "dependencies status")
[![Scrutinizer-CI code quality score](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/?branch=master "Scrutinizer-CI code quality score")
[![Scrutinizer-CI build status](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/badges/build.png?b=master)](https://scrutinizer-ci.com/g/bb-drummer/node-patternlibrary/build-status/master "Scrutinizer-CI build status")
[![Travis-CI build status](https://travis-ci.org/bb-drummer/node-patternlibrary.svg?branch=master)](https://travis-ci.org/bb-drummer/node-patternlibrary "Travis-CI build status")



---



## About


**Patternlibrary** (@ npm: _node-patternlibrary_) is a pattern/component documentation and static site generator for use with Node-JS. 

It generates a series of documentation pages for each of the HTML **patterns**, or _partials_, or _components_, structured in an **atomic design pattern**.
Documentation details are assembled from the specific pattern-files's source codes and supplied meta-data. 
Of course, like any other (Handlebars) partial, those patterns can also include other patterns, external (Handlebars) helpers or data as JSON or YAML, by themselfs.

These pages are combined under a GUI to view in your browser. It provides an overview dashboard, lists to browse patterns and categories and (kind of) interactive pattern documentation.

The template engine used is [*Handlebars*](http://handlebarsjs.com) and rendering _markdown_ is accomplished with [*MarkdownIt*](https://github.com/markdown-it/markdown-it). Parsing the style and script source files is utilizing ([*SassDoc*](http://sassdoc.com/)) and ([*JSDoc*](http://usejsdoc.org)).

Please, see the [*about* section](../readme.html) for more information



---



## Documentation



For detailed explanations of each of the parts that made up **Patternlibrary**, please see the following pages:



- [Installation and (basic) usage](./usage.html)

- [Configuration and options](./options.html)

- [Generating the pattern documentation](./patternspecs.html)

  To generate the pattern-specific documentation pages, at least one requirements must be satisfied for each pattern:

  - the [Pattern specifications](./patternspecs.html)
  
  
  Optionally, you can also apply...
  
  - [SASS reference documentation](./sassdoc.html),
  
  - [JavaScript reference documentation](./jsdoc.html),
  
  - a [`changelog.md` file](./changelog.html) and
  
  - [Test files and testing](./testing.html)
  
- [Building static pages](./staticpages.html)
  
- [GUI usage](./gui.html)
  
- [API documentation and advanced usage](./api.html)
  
- [Server/middleware usage](./middleware.html)





---

### Work-In-Progress disclaimer

This project is now going from some kind of *Proof Of Concept* to real-life implementation.
Most of its behavour and features are fixed for now.

When using this software, absolutely no warranties of any sort are granted. Please see the license file for more information.

---

