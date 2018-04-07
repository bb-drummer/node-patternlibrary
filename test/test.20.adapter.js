import Patternlibrary from '..';
import { src, dest } from 'vinyl-fs';
//import assert from 'assert';
import equal from 'assert-dir-equal';
import fs from 'fs';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';

var extend = require('deep-extend');
var expect = require('chai').expect;

const FIXTURES = 'test/fixtures/adapters/';

const CLEAN_UP = true;

describe('Patternlibrary instanciation and configuration:', function() {
	
    beforeEach(function(done) {
        this.timeout(5000); // A very long environment setup.
        done();
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
	        var p = new Patternlibrary.Patternlibrary();

	        expect(function() {
	            p.adapter('cats', 'kittens');
	        }).to.throw(Error);
	    });
	});

	describe('Patternlibrary "example" adapter:', () => {

	    it('builds a page with extra file rendered as example', function (done) {
	    	this.timeout(5000);
	    	
	        let patternlibraryOptions = {
	            verbose : false,
	            dest    : FIXTURES + 'example/build',
	            root    : FIXTURES + 'example/pages/',
	            layouts : FIXTURES + 'example/layouts/',
	            partials: FIXTURES + 'example/partials/',
	            testing : true
	        };
	        rimraf.sync(FIXTURES + 'example/build'); mkdirp(FIXTURES + 'example/build');
	        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
	    
	        p.run();
	    
	        setTimeout( function () {
	            equal(FIXTURES + 'example/expected/index.html', FIXTURES + 'example/build/index.html');
	            var docFile = fs.readFileSync(FIXTURES + 'example/build/pl/patterns/atoms/link/index.html').toString();
	            expect(docFile).to.include('<my example>');
	            if (CLEAN_UP) rimraf.sync(FIXTURES + 'example/build');
	            done();
	        }, 3000);

	    });

	    it('builds a page with source file rendered as example if none is give', function (done) {
	    	this.timeout(5000);
	    	
	        let patternlibraryOptions = {
	            verbose : false,
	            dest    : FIXTURES + 'noexample/build',
	            root    : FIXTURES + 'noexample/pages/',
	            layouts : FIXTURES + 'noexample/layouts/',
	            partials: FIXTURES + 'noexample/partials/',
	            testing : true
	        };
	        rimraf.sync(FIXTURES + 'noexample/build'); mkdirp(FIXTURES + 'noexample/build');
	        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
	    
	        p.run();
	    
	        setTimeout( function () {
	            equal(FIXTURES + 'noexample/expected/index.html', FIXTURES + 'noexample/build/index.html');
	            var docFile = fs.readFileSync(FIXTURES + 'noexample/build/pl/patterns/atoms/link/index.html').toString();
	            expect(docFile).to.include(
	            	'<h2 id="output-" class="docs-heading" data-magellan-target="output-">'+
	            		'Output:<a class="docs-heading-icon" href="#output-"></a>'+
		            '</h2>'+'\n'+
		            '\t\n'+
		            '<a class="" href=""></a>'
		        );
	            if (CLEAN_UP) rimraf.sync(FIXTURES + 'noexample/build');
	            done();
	        }, 3000);

	    });

	    it('builds a page with empty example if given file is missing', function (done) {
	    	this.timeout(5000);
	    	
	        let patternlibraryOptions = {
	            verbose : false,
	            dest    : FIXTURES + 'examplemissing/build',
	            root    : FIXTURES + 'examplemissing/pages/',
	            layouts : FIXTURES + 'examplemissing/layouts/',
	            partials: FIXTURES + 'examplemissing/partials/',
	            testing : true
	        };
	        rimraf.sync(FIXTURES + 'examplemissing/build'); mkdirp(FIXTURES + 'examplemissing/build');
	        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
	    
	        p.run();
	    
	        setTimeout( function () {
	            equal(FIXTURES + 'examplemissing/expected/index.html', FIXTURES + 'examplemissing/build/index.html');
	            var docFile = fs.readFileSync(FIXTURES + 'examplemissing/build/pl/patterns/atoms/link/index.html').toString();
	            expect(docFile).to.include(
	            	'<h2 id="output-" class="docs-heading" data-magellan-target="output-">'+
	            		'Output:<a class="docs-heading-icon" href="#output-"></a>'+
		            '</h2>'+'\n'+
		            '\t\n'+
		            '\n'+
		            '\t\n'+
		            '</section>'
		        );
	            if (CLEAN_UP) rimraf.sync(FIXTURES + 'examplemissing/build');
	            done();
	        }, 3000);

	    });
	    
    });

	describe('Patternlibrary "changelog" adapter:', () => {

	    it('builds a page with changelog info', function (done) {
	    	this.timeout(5000);
	    	
	        let patternlibraryOptions = {
	            verbose : false,
	            dest    : FIXTURES + 'changelog/build',
	            root    : FIXTURES + 'changelog/pages/',
	            layouts : FIXTURES + 'changelog/layouts/',
	            partials: FIXTURES + 'changelog/partials/',
	            testing : true
	        };
	        rimraf.sync(FIXTURES + 'changelog/build'); mkdirp(FIXTURES + 'changelog/build');
	        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
	    
	        p.run();
	    
	        setTimeout( function () {
	            equal(FIXTURES + 'changelog/expected/index.html', FIXTURES + 'changelog/build/index.html');
	            var docFile = fs.readFileSync(FIXTURES + 'changelog/build/pl/patterns/atoms/link/index.html').toString();
	            expect(docFile).to.include('<h3 id="062017">06/2017</h3>');
	            if (CLEAN_UP) rimraf.sync(FIXTURES + 'changelog/build');
	            done();
	        }, 3000);

	    });

	    it('builds a page with no changelog info', function (done) {
	    	this.timeout(5000);
	    	
	        let patternlibraryOptions = {
	            verbose : false,
	            dest    : FIXTURES + 'nochangelog/build',
	            root    : FIXTURES + 'nochangelog/pages/',
	            layouts : FIXTURES + 'nochangelog/layouts/',
	            partials: FIXTURES + 'nochangelog/partials/',
	            testing : true
	        };
	        rimraf.sync(FIXTURES + 'nochangelog/build'); mkdirp(FIXTURES + 'nochangelog/build');
	        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);
	    
	        p.run();
	    
	        setTimeout( function () {
	            equal(FIXTURES + 'nochangelog/expected/index.html', FIXTURES + 'nochangelog/build/index.html');
	            var docFile = fs.readFileSync(FIXTURES + 'nochangelog/build/pl/patterns/atoms/link/index.html').toString();
	            expect(docFile).to.include('no change-log info available...');
	            if (CLEAN_UP) rimraf.sync(FIXTURES + 'nochangelog/build');
	            done();
	        }, 3000);

	    });
	    
    });

});
