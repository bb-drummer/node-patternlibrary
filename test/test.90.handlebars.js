import Patternlibrary from '..';

import equal from 'assert-dir-equal';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';

var expect = require('chai').expect;
var $handlebars = require('../lib/vendor/handlebars');
var stripHtml = require('striptags');

/**
 * Compares the output of a $handlebars template to an expected string. Data can also be passed to the template function.
 * @param {string} input - String to compile into a $handlebars template.
 * @param {string} expected - Expected output of the template.
 * @param {object} data - Data to pass to the $handlebars context.
 * @throws {AssertionError} Throws an error if the $handlebars output and expected output are not equal.
 */
function compare(input, expected, data) {
  var template = $handlebars.compile(input);
  expect(template(data || {})).to.equal(expected);
}

// A note about assertions: most of these tests use the `compare()` function 
// above. However, in cases where the output needs to be modified in some way 
// before it's compared, or in cases where a substring is being searched for, 
// a $handlebars template is created manually inside of the test.

describe('Patternlibrary built-in Handlebars helpers', () => {

	const FIXTURES = 'test/fixtures.staticpages/';

	const CLEAN_UP = !true;

	var patternlibraryOptions = {
	    verbose: false,
	    dest : FIXTURES + 'build',
	    root    : FIXTURES + 'pages/',
	    layouts : FIXTURES + 'layouts',
	    partials: FIXTURES + 'partials'
	}
	
	describe('Structural', () => {

		describe('{{#repeat}}...{{/repeat}}', () => {
		    it('prints content multiple times', function (done) {
		    
		        patternlibraryOptions = {
		            verbose : false,
		            dest    : FIXTURES + 'helper-repeat/build',
		            root    : FIXTURES + 'helper-repeat/pages/',
		            layouts : FIXTURES + 'helper-repeat/layouts/',
		            partials: FIXTURES + 'helper-repeat/partials/',
		            nogui   : true,
		            testing : true
		        };
		        rimraf.sync(FIXTURES + 'helper-repeat/build'); mkdirp(FIXTURES + 'helper-repeat/build');
		        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
		    
		        p.run();
		    
		        setTimeout( function () {
		            equal(FIXTURES + 'helper-repeat/expected/index.html', FIXTURES + 'helper-repeat/build/index.html');
		            if (CLEAN_UP) rimraf.sync(FIXTURES + 'helper-repeat/build');
		            done();
		        }, 250);
		    
		    });
	    });

	    describe('{{#ifEqual}}...{{/ifEqual}}', () => {
		    it('compares two values', function (done) {
		    
		        patternlibraryOptions = {
		            verbose : false,
		            dest    : FIXTURES + 'helper-ifequal/build',
		            root    : FIXTURES + 'helper-ifequal/pages/',
		            layouts : FIXTURES + 'helper-ifequal/layouts/',
		            partials: FIXTURES + 'helper-ifequal/partials/',
		            nogui   : true,
		            testing : true
		        };
		        rimraf.sync(FIXTURES + 'helper-ifequal/build'); mkdirp(FIXTURES + 'helper-ifequal/build');
		        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
		    
		        p.run();
		    
		        setTimeout( function () {
		            equal(FIXTURES + 'helper-ifequal/expected/index.html', FIXTURES + 'helper-ifequal/build/index.html');
		            if (CLEAN_UP) rimraf.sync(FIXTURES + 'helper-ifequal/build');
		            done();
		        }, 250);
		    
		    });
	    });

	    describe('{{#ifpage}}...{{/ifpage}}', () => {
		    it('checks the current page', function (done) {
		    
		        patternlibraryOptions = {
		            verbose : false,
		            dest    : FIXTURES + 'helper-ifpage/build',
		            root    : FIXTURES + 'helper-ifpage/pages/',
		            layouts : FIXTURES + 'helper-ifpage/layouts/',
		            partials: FIXTURES + 'helper-ifpage/partials/',
		            nogui   : true,
		            testing : true
		        };
		        rimraf.sync(FIXTURES + 'helper-ifpage/build'); mkdirp(FIXTURES + 'helper-ifpage/build');
		        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
		    
		        p.run();
		    
		        setTimeout( function () {
		            equal(FIXTURES + 'helper-ifpage/expected/index.html', FIXTURES + 'helper-ifpage/build/index.html');
		            equal(FIXTURES + 'helper-ifpage/expected/about.html', FIXTURES + 'helper-ifpage/build/about.html');
		            if (CLEAN_UP) rimraf.sync(FIXTURES + 'helper-ifpage/build');
		            done();
		        }, 250);
		    
		    });
	    });

	    describe('{{#unlesspage}}...{{/unlesspage}}', () => {
		    it('checks the current page (negation of ifpage)', function (done) {
		    
		        patternlibraryOptions = {
		            verbose : false,
		            dest    : FIXTURES + 'helper-unlesspage/build',
		            root    : FIXTURES + 'helper-unlesspage/pages/',
		            layouts : FIXTURES + 'helper-unlesspage/layouts/',
		            partials: FIXTURES + 'helper-unlesspage/partials/',
		            nogui   : true,
		            testing : true
		        };
		        rimraf.sync(FIXTURES + 'helper-unlesspage/build'); mkdirp(FIXTURES + 'helper-unlesspage/build');
		        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
		    
		        p.run();
		    
		        setTimeout( function () {
		            equal(FIXTURES + 'helper-unlesspage/expected/index.html', FIXTURES + 'helper-unlesspage/build/index.html');
		            equal(FIXTURES + 'helper-unlesspage/expected/about.html', FIXTURES + 'helper-unlesspage/build/about.html');
		            if (CLEAN_UP) rimraf.sync(FIXTURES + 'helper-unlesspage/build');
		            done();
		        }, 250);
		    
		    });
	    });

	    describe('{{#ifCond}}...{{else}}...{{/ifCond}}', () => {
	    	
		    it('{{#ifCond mode="eq" value... comp...}} checks if "value" "equals" "comp"', function () {
		    	compare('{{#ifCond mode="eq" value="a" comp="a"}}true{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="eq" value="a" comp="b"}}true{{/ifCond}}', '');
		    	compare('{{#ifCond mode="eq" value="b" comp="a"}}true{{/ifCond}}', '');
		    	compare('{{#ifCond mode="eq" value="a" comp="a"}}true{{else}}false{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="eq" value="a" comp="b"}}true{{else}}false{{/ifCond}}', 'false');
		    	compare('{{#ifCond mode="eq" value="b" comp="a"}}true{{else}}false{{/ifCond}}', 'false');
		    });
	    	
		    it('{{#ifCond mode="neq" value... comp...}} checks if "value" "not equals" "comp"', function () {
		    	compare('{{#ifCond mode="neq" value="a" comp="a"}}true{{/ifCond}}', '');
		    	compare('{{#ifCond mode="neq" value="a" comp="b"}}true{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="neq" value="b" comp="a"}}true{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="neq" value="a" comp="a"}}true{{else}}false{{/ifCond}}', 'false');
		    	compare('{{#ifCond mode="neq" value="a" comp="b"}}true{{else}}false{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="neq" value="b" comp="a"}}true{{else}}false{{/ifCond}}', 'true');
		    });
	    	
		    it('{{#ifCond mode="lt" value... comp...}} checks if "value" "is lower to" "comp"', function () {
		    	compare('{{#ifCond mode="lt" value="a" comp="a"}}true{{/ifCond}}', '');
		    	compare('{{#ifCond mode="lt" value="a" comp="b"}}true{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="lt" value="b" comp="a"}}true{{/ifCond}}', '');
		    	compare('{{#ifCond mode="lt" value="a" comp="a"}}true{{else}}false{{/ifCond}}', 'false');
		    	compare('{{#ifCond mode="lt" value="a" comp="b"}}true{{else}}false{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="lt" value="b" comp="a"}}true{{else}}false{{/ifCond}}', 'false');
		    });
	    	
		    it('{{#ifCond mode="lte" value... comp...}} checks if "value" "is lower or equal to" "comp"', function () {
		    	compare('{{#ifCond mode="lte" value="a" comp="a"}}true{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="lte" value="a" comp="b"}}true{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="lte" value="b" comp="a"}}true{{/ifCond}}', '');
		    	compare('{{#ifCond mode="lte" value="a" comp="a"}}true{{else}}false{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="lte" value="a" comp="b"}}true{{else}}false{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="lte" value="b" comp="a"}}true{{else}}false{{/ifCond}}', 'false');
		    });
	    	
		    it('{{#ifCond mode="gt" value... comp...}} checks if "value" "is greater to" "comp"', function () {
		    	compare('{{#ifCond mode="gt" value="a" comp="a"}}true{{/ifCond}}', '');
		    	compare('{{#ifCond mode="gt" value="a" comp="b"}}true{{/ifCond}}', '');
		    	compare('{{#ifCond mode="gt" value="b" comp="a"}}true{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="gt" value="a" comp="a"}}true{{else}}false{{/ifCond}}', 'false');
		    	compare('{{#ifCond mode="gt" value="a" comp="b"}}true{{else}}false{{/ifCond}}', 'false');
		    	compare('{{#ifCond mode="gt" value="b" comp="a"}}true{{else}}false{{/ifCond}}', 'true');
		    });
	    	
		    it('{{#ifCond mode="gte" value... comp...}} checks if "value" "is greater or equal to" "comp"', function () {
		    	compare('{{#ifCond mode="gte" value="a" comp="a"}}true{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="gte" value="a" comp="b"}}true{{/ifCond}}', '');
		    	compare('{{#ifCond mode="gte" value="b" comp="a"}}true{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="gte" value="a" comp="a"}}true{{else}}false{{/ifCond}}', 'true');
		    	compare('{{#ifCond mode="gte" value="a" comp="b"}}true{{else}}false{{/ifCond}}', 'false');
		    	compare('{{#ifCond mode="gte" value="b" comp="a"}}true{{else}}false{{/ifCond}}', 'true');
		    });
		    
	    });
		
	});

	describe('Formatting', () => {

		describe('{{#code}}...{{/code}}', () => {
		    it('renders code blocks (given style "css") ', function (done) {
		    
		        patternlibraryOptions = {
		            verbose : false,
		            dest    : FIXTURES + 'helper-code/build',
		            root    : FIXTURES + 'helper-code/pages/',
		            layouts : FIXTURES + 'helper-code/layouts/',
		            partials: FIXTURES + 'helper-code/partials/',
		            nogui   : true,
		            testing : true
		        };
		        rimraf.sync(FIXTURES + 'helper-code/build'); mkdirp(FIXTURES + 'helper-code/build');
		        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
		    
		        p.run();
		    
		        setTimeout( function () {
		            equal(FIXTURES + 'helper-code/expected/index.html', FIXTURES + 'helper-code/build/index.html');
		            if (CLEAN_UP) rimraf.sync(FIXTURES + 'helper-code/build');
		            done();
		        }, 250);
		    
		    });
		    
		    it('renders code blocks (default style "html")', function (done) {
		    
		        patternlibraryOptions = {
		            verbose : false,
		            dest    : FIXTURES + 'helper-code-default/build',
		            root    : FIXTURES + 'helper-code-default/pages/',
		            layouts : FIXTURES + 'helper-code-default/layouts/',
		            partials: FIXTURES + 'helper-code-default/partials/',
		            nogui   : true,
		            testing : true
		        };
		        rimraf.sync(FIXTURES + 'helper-code-default/build'); mkdirp(FIXTURES + 'helper-code-default/build');
		        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
		    
		        p.run();
		    
		        setTimeout( function () {
		            equal(FIXTURES + 'helper-code-default/expected/index.html', FIXTURES + 'helper-code-default/build/index.html');
		            if (CLEAN_UP) rimraf.sync(FIXTURES + 'helper-code-default/build');
		            done();
		        }, 250);
		    
		    });
        });

	    describe('{{#markdown}}...{{/markdown}}', () => {
		    it('converts Markdown to HTML (block-helper)', function (done) {
		    
		        patternlibraryOptions = {
		            verbose : false,
		            dest    : FIXTURES + 'helper-markdown/build',
		            root    : FIXTURES + 'helper-markdown/pages/',
		            layouts : FIXTURES + 'helper-markdown/layouts/',
		            partials: FIXTURES + 'helper-markdown/partials/',
		            nogui   : true,
		            testing : true
		        };
		        rimraf.sync(FIXTURES + 'helper-markdown/build'); mkdirp(FIXTURES + 'helper-markdown/build');
		        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
		    
		        p.run();
		    
		        setTimeout( function () {
		            equal(FIXTURES + 'helper-markdown/expected/index.html', FIXTURES + 'helper-markdown/build/index.html');
		            if (CLEAN_UP) rimraf.sync(FIXTURES + 'helper-markdown/build');
		            done();
		        }, 250);
		    
		    });
        });
	    
        describe('{{md}}', () => {
            it('converts Markdown to HTML (helper with parameter)', () => {
                compare('{{md "**Bold**"}}', '<p><strong>Bold</strong></p>\n');
            });
        });
    
        describe('{{#heading}}...{{/heading}}', () => {
            it('creates a heading of a specific level', () => {
                var expected = '<h1 id="title" class="docs-heading">Title<a class="docs-heading-icon" href="#title"></a></h1>';
        
                compare('{{#heading 1}}Title{{/heading}}', expected);
            });
    
            it('creates a heading with a custom ID', () => {
                var expected = '<h1 id="custom" class="docs-heading">Title<a class="docs-heading-icon" href="#custom"></a></h1>';
        
                compare('{{#heading 1 "custom"}}Title{{/heading}}', expected);
            });
        });
    
        describe('{{escape}}', () => {
            it('escapes text for use in a URL hash', () => {
                compare('{{escape "this text"}}', 'this-text');
            });
        });
    
        describe('{{toUpper}}', () => {
            it('capitalizes the first letter of a string', () => {
                compare('{{toUpper "kittens"}}', 'Kittens');
            });
            it('retruns empty string when missing parameter', () => {
                compare('{{toUpper }}', '');
            });
        });
    
        describe('{{toLower}}', () => {
            it('converts a string to lowercase', () => {
                compare('{{toLower "SHOUT"}}', 'shout')
            });
            it('retruns empty string when missing parameter', () => {
                compare('{{toLower }}', '');
            });
        });
    
        describe('{{raw}}...{{/raw}}', () => {
            it('ignores $handlebars', () => {
                compare('{{{{raw}}}}{{ignore}}{{{{/raw}}}}', '{{ignore}}');
            });
        });
    
        describe('{{formatJson}}', () => {
            it('ignores $handlebars', () => {
            	var data = {
            		myObj : {
            			"myKey" : "some value"
            		}
            	}
                compare('{{formatJson myObj}}', '{&quot;myKey&quot;:&quot;some value&quot;}', data);
            });
        });
    
        describe('{{texthelper}}', () => {
            it('outputs predefined static text pattern', () => {
                compare('{{texthelper "lastname"}}', 'Mustermann')
            });
            it('outputs parameter value when text pattern is unknown', () => {
                compare('{{texthelper "some pattern"}}', 'some pattern')
            });
            it('outputs default medium length lorem-ipsum text when parameter is missing', () => {
                compare('{{texthelper }}', 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.');
            });
        });
    
        describe('{{#filter}}...{{/filter}}', () => {
            it('filters private SassDoc and JSDoc objects', () => {
                var data = {
                    item: { access: 'private' }
                };
        
                compare('{{#filter item}}Private{{/filter}}', '', data);
            });
    
            it('displays public SassDoc and JSDoc objects', () => {
                var data = {
                    item: { access: 'public' }
                };
        
                compare('{{#filter item}}Public{{/filter}}', 'Public', data);
            });
    
            it('filters SassDoc aliases', () => {
                var data = {
                    item: { alias: true }
                };
        
                compare('{{#filter item}}Alias{{/filter}}', '', data);
            });
        });
    });

    describe('JavaScript', () => {
        describe('{{writeJsConstructor}}', () => {
            it('prints formatted JavaScript code to initialize a Patternlibrary/Siteapp plugin', () => {
                var template = $handlebars.compile('{{writeJsConstructor "Plugin"}}');
                var output = template();
        
                expect(output, 'Should be formatted by Highlight.js').to.contain('hljs');
                expect(stripHtml(output), 'Should include Patternlibrary/Siteapp code').to.equal('var elem = new YourApp.Plugin(element, options);');
            });
        });
    
        describe('{{writeJsFunction}}', () => {
            it('prints a JavaScript function with no parameters', () => {
                var data = {
                    method: {
                        name: 'petKitty',
                        params: []
                    }
                };
        
                var template = $handlebars.compile('{{writeJsFunction method}}');
                var output = template(data);
        
                expect(stripHtml(output)).to.equal(`$('#element').your_app('petKitty');`);
            });
    
            it('prints a JavaScript function with parameters', () => {
                var data = {
                    method: {
                        name: 'petKitty',
                        params: [
                            { name: 'param1' },
                            { name: 'param2' }
                        ]
                    }
                };
        
                var template = $handlebars.compile('{{writeJsFunction method}}');
                var output = template(data);
        
                expect(stripHtml(output)).to.equal(`$('#element').your_app('petKitty', param1, param2);`);
            });
        });
    
        describe('{{formatJsModule}}', () => {
            it('converts a JSDoc module definition to a filename', () => {
                compare('{{formatJsModule "module:foundation.toggler"}}', 'foundation.toggler.js');
            });
        });
    
        describe('{{formatJsOptionName}}', () => {
            it('converts a plugin option name to an HTML data attribute', () => {
                compare('{{formatJsOptionName "optionName"}}', 'data-option-name');
            });
        });
    
        describe('{{formatJsOptionValue}}', () => {
            it('prints non-String values as-is', () => {
                var data = {
                    value: '0'
                };
        
                compare('{{formatJsOptionValue value}}', '0', data);
            });
    
            it('prints String values without the quotes on either side', () => {
                var data = {
                    singleQuotes: "'value'",
                    multiQuotes: '"value"'
                };
        
                compare(`{{formatJsOptionValue singleQuotes}}`, 'value', data);
                compare(`{{formatJsOptionValue multiQuotes}}`, 'value', data);
            });
    
            it('returns an empty string if an option is missing a value', () => {
                compare('{{formatJsOptionValue undef}}', '');
            });
        });
        
        describe('{{formatJsOptionTypes}}', () => {
            it('formats JsDoc "type" definitions to read "x or y or z"', () => {
                var data = {
                	types : {
                        names: ['abc', 'def', 'ghi']
                    }
                };
        
                compare(`{{formatJsOptionTypes types}}`, 'abc or def or ghi', data);
            });
    
            it('returns an empty string if no type names are present', () => {
                compare('{{formatJsOptionTypes undef}}', '');
            });
        });
    
        describe('{{formatJsEventName}}', () => {
            it('formats a JSDoc event to look like "YourApp"-namespaced events', () => {
                var data = {
                    name: 'event',
                    title: 'Plugin'
                };
        
                compare('{{formatJsEventName name title}}', 'event.zf.plugin', data);
            });
    
            it('handles plugin names that are intercapped', () => {
                var data = {
                    name: 'event',
                    title: 'PluginName'
                };
        
                compare('{{formatJsEventName name title}}', 'event.zf.pluginName', data);
            });
        });
    });

    describe('Links', () => {
    	
        describe('{{editLink}}', () => {
            it('generates a GitHub edit link point to a repository, branch, and file', () => {
                compare('{{editLink "foundation-sites" "master" "docs/pages/index.html"}}', 'https://github.com/zurb/foundation-sites/edit/master/docs/pages/index.md');
            });
        });
    
        describe('{{issueLink}}', () => {
            it('generates a GitHub link to open a new issue, with a preset title', () => {
                var template = $handlebars.compile('{{issueLink "foundation-sites" "Plugin"}}');
                var output = template();
        
                expect(output, 'links to GitHub issue tracker').to.contain('https://github.com/zurb/foundation-sites/issues/new?title');
                expect(output, 'includes tag in preset title').to.contain('Plugin');
                expect(output, 'includes super loud title that you should replace').to.contain('ISSUE%20NAME%20HERE');
            });
        });
        
        describe('{{categorylink}}', () => {
        	it('generates a relative url assembled from a current categories\' root path and category name', () => {
        		var data = {
        			categoriesroot : '../pl/categories'
        		}
        		
        		compare('{{categorylink "basic"}}', '../pl/categories/basic', data);
        	});
        });
        
        describe('{{patternlink}}', () => {
        	it('generates a relative url assembled from a current patterns\' root path and pattern\'s type/name identifier', () => {
        		var data = {
        				patternsroot : '../pl/'
        		}
        		
        		compare('{{patternlink "atom/link"}}', '../pl/atoms/link', data);
        		compare('{{patternlink "molecule/panel"}}', '../pl/molecules/panel', data);
        		compare('{{patternlink "organism/teaser"}}', '../pl/organisms/teaser', data);
        		compare('{{patternlink "component/dropdown"}}', '../pl/components/dropdown', data);
        		compare('{{patternlink "template/servicepages"}}', '../pl/templates/servicepages', data);
        		compare('{{patternlink "page/contactpage"}}', '../pl/pages/contactpage', data);
        		
        	});
        });
        
    });

    describe('Sass', () => {
        describe('{{writeSassMixin}}', () => {
            it('formats a Sass mixin with no parameters', () => {
            var data = {
                mixin: {
                context: { name: 'name' }
                }
            };
    
            var template = $handlebars.compile('{{writeSassMixin mixin}}');
            var output = stripHtml(template(data));
    
            expect(output).to.equal('@include name;');
            });
    
            it('formats a Sass mixin with parameters', () => {
                var data = {
                    mixin: {
                        context: { name: 'name' },
                        parameter: [
                            { name: 'param1' },
                            { name: 'param2' }
                        ]
                    }
                };
        
                var template = $handlebars.compile('{{writeSassMixin mixin}}');
                var output = stripHtml(template(data));
        
                expect(output).to.equal('@include name($param1, $param2);');
            });
    
            it('formats a Sass mixin with a @content directive', () => {
                var data = {
                    mixin: {
                        context: { name: 'name' },
                        content: 'Content'
                    }
                };
        
                var template = $handlebars.compile('{{writeSassMixin mixin}}');
                var output = stripHtml(template(data));
        
                expect(output).to.equal('@include name { }');
            });
        });
    
        describe('{{writeSassFunction}}', () => {
            it('formats a Sass function with no parameters', () => {
                var data = {
                    func: {
                    context: { name: 'name' }
                    }
                };
        
                var template = $handlebars.compile('{{writeSassFunction func}}');
                var output = stripHtml(template(data));
        
                expect(output).to.equal('name()');
            });
    
            it('formats a Sass function with parameters', () => {
                var data = {
                    func: {
                    context: { name: 'name' },
                        parameter: [
                            { name: 'param1' },
                            { name: 'param2' }
                        ]
                    }
                };
        
                var template = $handlebars.compile('{{writeSassFunction func}}');
                var output = stripHtml(template(data));
        
                expect(output).to.equal('name($param1, $param2)');
            });
        });
    
        describe('{{writeSassVariable}}', () => {
            it('formats a Sass variable', () => {
                var data = {
                    variable: {
                    context: {
                        name: 'name',
                        value: 'value'
                    }
                    }
                };
        
                var template = $handlebars.compile('{{writeSassVariable variable}}');
                var output = stripHtml(template(data));
        
                expect(output).to.equal('$name: value;');
            });
        });
    
        describe('{{formatSassTypes}}', () => {
            it('formats a SassDoc @type annotation with one value', () => {
                compare('{{formatSassTypes "String"}}', 'String');
            });
    
            it('formats a SassDoc @type annotation with multiple values', () => {
                compare('{{formatSassTypes "String|List"}}', 'String or List');
            });
    
            it('prints an empty string if no value is defined', () => {
                compare('{{formatSassTypes undef}}', '');
            });
        });
    
        describe('{{formatSassValue}}', () => {
            it('formats basic values as-is', () => {
                compare('{{formatSassValue "value"}}', 'value');
            });
    
            it('formats maps with each value on a separate line', () => {
                var template = $handlebars.compile(`{{formatSassValue '(one: one,two: two)'}}`);
                var output = template();
        
                expect(output).to.equal('one: one&lt;br&gt;two: two');
            });
    
            it('returns the word "None" for undefined values', () => {
                var template = $handlebars.compile('{{formatSassValue undef}}');
                var output = template();
        
                expect(output).to.contain('None');
            });
        });
    
        describe('{{writeSassLink}}', () => {
            it('formats a SassDoc @link annotation', () => {
                var data = {
                    link: [{
                    url: '#',
                    caption: 'Caption'
                    }]
                };
        
                compare('{{writeSassLink link}}', '<p><strong>Learn more:</strong> <a href="#">Caption</a></p>', data);
            });
    
            it('prints an empty string for an undefined link', () => {
                compare('{{writeSassLink undef}}', '');
            });
        });
    });
});
