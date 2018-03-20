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

		describe('{{#repeat}}{{/repeat}}', () => {
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

	    describe('{{#ifEqual}}{{/ifEqual}}', () => {
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

	    describe('{{#ifpage}}{{/ifpage}}', () => {
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

	    describe('{{#unlesspage}}{{/unlesspage}}', () => {
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
		
	});

	describe('Formatting', () => {

		describe('{{#code}}{{/code}}', () => {
		    it('renders code blocks', function (done) {
		    
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
        });

	    describe('{{#markdown}}{{/markdown}}', () => {
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
    
        describe('{{#heading}}{{/heading}}', () => {
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
        });
    
        describe('{{toLower}}', () => {
            it('converts a string to lowercase', () => {
                compare('{{toLower "SHOUT"}}', 'shout')
            });
        });
    
        describe('{{raw}}{{/raw}}', () => {
            it('ignores $handlebars', () => {
                compare('{{{{raw}}}}{{ignore}}{{{{/raw}}}}', '{{ignore}}');
            });
        });
    
        describe('{{#filter}}{{/filter}}', () => {
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
