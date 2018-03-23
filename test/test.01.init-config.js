import Patternlibrary from '..';

var extend = require('deep-extend');
var expect = require('chai').expect;

var defaults = require('../lib/config/defaults');

describe('Patternlibrary instanciation and configuration:', function() {

	describe('Patternlibrary.config()', function() {
		
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
	});
	
	describe('Patternlibrary.config() - patterns\' options checks', function() {
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
	
	describe('Patternlibrary.config() - adapter patterns\' options checks', function() {
		
	    it('throws error if the pattern\'s adapter "source" search pattern option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.source = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the pattern\'s adapter "readme" search pattern option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.readme = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the pattern\'s adapter "scss" search pattern option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.scss = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the pattern\'s adapter "javascript" search pattern option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.javascript = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the pattern\'s adapter "changelog" search pattern option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.changelog = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the pattern\'s adapter "tests" search pattern option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.pattern.tests = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
	    
	});
	
	describe('Patternlibrary.config() - GUI paths\' options checks', function() {
		
	    it('throws error if the GUI\'s options are missing in the first place', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.gui = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('...but is ok when no GUI is requested at all', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.gui = null;
	    	cfg.nogui = true;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).not.to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the GUI\'s pages option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.gui.pages = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the GUI\'s partials option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.gui.partials = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the GUI\'s layouts dir option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.gui.layouts = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the GUI\'s layout template-file option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.gui.layout = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the GUI\'s doc-page template-file option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.gui.docpage = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the GUI\'s dashboard template-file option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.gui.dashboard = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the GUI\'s pattern-list template-file option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.gui.patternlist = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the GUI\'s category-list template-file option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.gui.categorylist = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
	    
	});
	
	describe('Patternlibrary.config() - static pages paths\' options checks', function() {
		
	    it('throws error if the static pages\' "root" source dir option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.root = null;
	    	
	        expect(function() {
	            p.config(cfg);
	        }).to.throw(Error);
	        
	    	cfg.pattern.target = '';
	        expect(function() { p.config(cfg); }).to.throw(Error);
	    });
		
	    it('throws error if the static pages\' "layouts" source-dir option is missing or empty', function() {
	        var p = new Patternlibrary.Patternlibrary();
	        var cfg = extend({}, defaults);
	    	cfg.layouts = null;
	    	
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
	
	describe('Patternlibrary.reset()', function() {
		it('should clear all pattern-, category- and user data', function () {
	        var p = new Patternlibrary.Patternlibrary();
	        p.data.someKey = 'some value';
	        p.reset();
			expect(p.data).not.to.have.a.key('someKey');
			expect(p.data.patterns).to.be.a('object');
			expect(p.data.categories).to.be.a('object');
			expect(Object.keys(p.data.patterns).length).to.equal(0);
			expect(Object.keys(p.data.categories).length).to.equal(0);
		});
	});
	

});
