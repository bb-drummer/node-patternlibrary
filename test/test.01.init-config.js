import Patternlibrary from '..';

var extend = require('deep-extend');
var expect = require('chai').expect;

describe('Patternlibrary instanciation and configuration:', function() {

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
	

});
