# (Node-)**Patternlibrary**

[![Scrutinizer Code Quality](https://scrutinizer-ci.com/gl/bjoernbartels-earth/js/patternlibrary/badges/quality-score.png?b=master&s=974f5fcc342590b04f6b62f995f7f991ad6e32c7)](https://scrutinizer-ci.com/gl/bjoernbartels-earth/js/patternlibrary/?branch=master)
[![Build Status](https://scrutinizer-ci.com/gl/bjoernbartels-earth/js/patternlibrary/badges/build.png?b=master&s=bcca11629f60424efbc35db6c110e4091a513681)](https://scrutinizer-ci.com/gl/bjoernbartels-earth/js/patternlibrary/build-status/master)


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

The main template engine behind this is *handlebars* ([-> homepage](http://handlebarsjs.com)) which itself is extended by *Zurb Foundation*'s *Panini* ([-> GitHub](https://github.com/zurb/panini)). The style and script source files are parsed by *Zurb Foundation*'s *Supercollider* ([-> GitHub](https://github.com/zurb/supercollider)) utilizing [SassDoc](http://sassdoc.com/) and [JSDoc](http://usejsdoc.org).


## Documentation


For detailed explanations of each of the parts that made up **Patternlibrary**, please see the following pages:

- [Installation and (basic) usage](docs/usage_docs.md)

- [Options](docs/options_docs.md)

- [Generating pattern documentation](docs/patternspecs_docs.md)

  To generate the pattern-specific documentation pages, at least two requirements must be satisfied for each pattern:

  - the [Pattern specifications](docs/patternspecs_docs.md)
  
  and...
  
  - the [`readme.md` file](docs/readme_docs.md)
  
  
  Optionally, you can also apply...
  
  - [SASS reference documentation](docs/sassdoc_docs.md),
  
  - [JavaScript reference documentation](docs/jsdoc_docs.md),
  
  - a [`changelog.md` file](docs/changelog_docs.md) and
  
  - [Test files and testing](docs/testing_docs.md)
  
- [GUI usage](docs/gui_docs.md)
  
- [API documentation and advanced usage](docs/api_docs.md)


