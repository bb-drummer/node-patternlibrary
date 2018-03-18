import Patternlibrary from '..';

var extend = require('deep-extend');
var expect = require('chai').expect;

describe('Patternlibrary basic templating:', function() {

	describe('Patternlibrary.layout', function() {
		
		it('assings a handlebars default layout "{{> body}}" from an empty template name', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        p.layout = '';
	        expect(p.layout).to.be.a('function');
	        
	        p.handlebars.registerPartial('body', 'I am here');
	        var rendered = p.layout({});
	        expect(rendered).to.equal('I am here')
		});
		
	    it('assings a handlebars layout by template name from module dir', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        p.layout = 'ajax';
	        expect(p.layout).to.be.a('function');
	        
	        p.handlebars.registerPartial('body', 'I am here');
	        var rendered = p.layout({});
	        expect(rendered).to.equal('I am here')
		});
		
	    it('assings a handlebars layout by template name from project dir', function() {
			const FIXTURES = 'test/fixtures.core/basic/';

			var patternlibraryOptions = {
			    verbose : false,
			    dest    : FIXTURES + 'build',
			    root    : FIXTURES + 'pages/',
			    layouts : FIXTURES + 'layouts',
			    partials: FIXTURES + 'partials'
			}

	        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
	        p.layout = 'mylayout';
	        expect(p.layout).to.be.a('function');
	        
	        p.handlebars.registerPartial('body', 'I am here');
	        var rendered = p.layout({});
	        expect(rendered).to.equal("<html>\n  <body>\n    <h1>My Layout</h1>\n    I am here  </body>\n</html>\n")
		});
		
	    it('throws an error if layout could not be found by template name', function() {
	        var p = new Patternlibrary.Patternlibrary();

	        expect(function() {
		        p.layout = 'some_unknown_templatefile';
	        }).to.throw(Error);
		});
        
	});
	
});
