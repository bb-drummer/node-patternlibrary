import Patternlibrary from '..';

var extend = require('deep-extend');
var expect = require('chai').expect;

describe('Patternlibrary instanciation and configuration:', function() {

	describe('Patternlibrary constructor', function() {
	    it('creates a new instance of Patternlibrary', function() {
		    var p = new Patternlibrary.Patternlibrary();
		    expect(p).to.be.an.instanceOf(Patternlibrary.Patternlibrary);
	    });
	
	    it('sets blank defaults for config settings', function() {
		    var p = new Patternlibrary.Patternlibrary();
		
		    expect(p.options).to.be.an('object');
		    expect(p.searchOptions).to.be.an('object');
		    expect(p.searchOptions).to.have.all.keys(['extra', 'sort', 'pageTypes']);
		    expect(p.adapters).to.be.an('object');
		    expect(p.data).to.be.an('object');
		    expect(p.data.patterns).to.be.an('object');
		    expect(p.data.categories).to.be.an('object');
		    expect(p.template).to.be.null;

		    expect(p.handlebars).to.be.an('object');

		    expect(p.markdown).to.be.an('object');
		    
	    });
	
	    it('initalizes Handlebars instance', function() {
		    var p = new Patternlibrary.Patternlibrary();
		

	        expect(p).to.be.an.instanceOf(Patternlibrary.Patternlibrary);

		    expect(p.handlebars).to.be.an('object');
		    
	    });
	
	    it('initalizes MarkdownIt instance', function() {
		    var p = new Patternlibrary.Patternlibrary();

	        expect(p).to.be.an.instanceOf(Patternlibrary.Patternlibrary);

		    expect(p.markdown).to.be.an('object');
		    
	    });
	    
	});
	
	describe('Patternlibrary.config()', function() {
		var defaults = require('../lib/config/defaults');
		
	    it('merges default and user configuration objects', function() {
	        var p = new Patternlibrary.Patternlibrary();
	    	
	    	p.config({
	    		'my-key': 'my-value',
	    		somekey : 'some value'
	    	});

	    	expect(p.options).to.be.an('object');
	        expect(p.options).to.have.a.property('my-key');
	    	expect(p.options['my-key']).to.equal('my-value');
	        expect(p.options).to.have.a.property('somekey');
	    	expect(p.options.somekey).to.equal('some value');
	    	
	    });
		
	    it('throws error if the "partials" source path option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	        
	    	cfg.partials = null;
	        expect(function() { p.config(cfg); }).to.throw(Error);
	        
	    	cfg.partials = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the destination directory "dest" option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.dest = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.dest = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the URL "basepath" sub-path option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.basepath = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.basepath = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the URL "patternspath" sub-path option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.patternspath = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.patternspath = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the URL "categoriespath" sub-path option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.categoriespath = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.categoriespath = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the pattern\'s "pattern" option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    });
		
	    it('throws error if the pattern\'s "dirs" option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.dirs = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.dirs = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the pattern\'s "atoms" sub-path option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.dirs.atoms = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.dirs.atoms = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the pattern\'s "molecules" sub-path option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.dirs.molecules = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.dirs.molecules = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the pattern\'s "organisms" sub-path option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.dirs.organisms = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.dirs.organisms = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the pattern\'s "templates" sub-path option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.dirs.templates = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.dirs.templates = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the pattern\'s "pages" sub-path option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.dirs.pages = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.dirs.pages = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the pattern\'s "searchpath" sub-path pattern option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.searchpath = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.searchpath = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the pattern\'s "target" filename option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.target = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
	    
	    
	});
	
	describe('Patternlibrary.init()', function() {
		
		it('should contain no \'handlebars\' instance before first execution', function () {
			expect(Patternlibrary.handlebars).to.be.undefined;
		});
		it('should contain a \'handlebars\' instance after instantiation', function () {
	        var p = new Patternlibrary.Patternlibrary();
			expect(p.handlebars).not.to.be.undefined;
			expect(p.handlebars).to.be.a('object');
		});
		
		it('should contain no \'markdown-it\' instance before first execution', function () {
			expect(Patternlibrary.markdown).to.be.undefined;
		});
		it('should contain a \'markdown-it\' instance after instantiation', function () {
	        var p = new Patternlibrary.Patternlibrary();
			expect(p.markdown).not.to.be.undefined;
			expect(p.markdown).to.be.a('object');
		});
		
	});
	
	describe('Patternlibrary.layout', function() {
		
	    it('assings a handlebars default layout "{{> body}}" from an empty template name', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        p.layout = '';
	        expect(p.layout).to.be.a('function');
	        
	        p.handlebars.registerPartial('body', 'I am here');
	        var rendered = p.layout({});
	        expect(rendered).to.equal('I am here')
		});
		
	    it('assings a handlebars layout from template name', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        p.layout = 'ajax';
	        expect(p.layout).to.be.a('function');
	        
	        p.handlebars.registerPartial('body', 'I am here');
	        var rendered = p.layout({});
	        expect(rendered).to.equal('I am here')
		});
		
	    it('throws an error if layout could not be found by template name', function() {
	        var p = new Patternlibrary.Patternlibrary();

	        expect(function() {
		        p.layout = 'some_unknown_templatefile';
	        }).to.throw(Error);
		});
        
	});
	
	describe('Patternlibrary.adapter()', function() {
	    it('loads built-in adapters', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        p = p.adapter('sass');
	    
	        expect(p).to.be.an.instanceOf(Patternlibrary.Patternlibrary);
	        expect(p.adapters).to.have.a.property('sass');
	        expect(p.adapters.sass.config).to.exist;
	    
	    });
	
	    it('throws an error if you try to load a non-existant built-in adapter', function() {
	        var p = new Patternlibrary.Patternlibrary();
	    
	        expect(function() {
	            p.adapter('kitten');
	        }).to.throw(Error);
	    });
	
	    it('loads custom adapters', function() {
	    var p = new Patternlibrary.Patternlibrary();
	    p = p.adapter('custom', function() {});
	
	    expect(p.adapters).to.have.a.property('custom');
	        expect(p.adapters.custom).to.be.a('function');
	    });
	
	    it('throws an error if you use a reserved keyword as an adapter name', function() {
	        var p = new Patternlibrary.Patternlibrary();
	    
	        expect(function() {
	            p.adapter('docs', function() {});
	        }).to.throw(Error);
	    });
	
	    it('throws an error if you try to pass something other than a function as an adapter', function() {
	        var s = new Patternlibrary.Patternlibrary();
	    
	        expect(function() {
	            p.adapter('docs', 'kittens');
	        }).to.throw(Error);
	    });
	});

});
