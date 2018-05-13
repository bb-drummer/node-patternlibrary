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

	describe('Patternlibrary "specs" adapter:', () => {
		
    	let adapter = require('../lib/adapters/specs.js');

	    it('scans data from pattern source file', function (done) {
	    	
	    	adapter(
	    		'test/fixtures/adapters/example/partials/atoms/link/atom-link.html',
	    		{},
	    		( a, b ) => { 
	    			console.log(b);
	    			expect(b.pattern.name).to.be.a('string').that.is.equal('atom/link'); 
	    			expect(b.pattern.categories).to.be.an('array').that.is.deep.equal(['basics','texts']); 
	    			done(); 
	    		},
	    		null
	    	);
	    });

	    it('search method returns empty result', function () {
	    	
	    	let result = adapter.search();
	    	expect(result).to.be.empty;
	    });
	    
    });

	describe('Patternlibrary "sourcecode" adapter:', () => {
		
    	let adapter = require('../lib/adapters/sourcecode.js');

	    it('retrieves pattern\'s source-code from file', function (done) {
	    	
	    	adapter(
	    		'test/fixtures/adapters/example/partials/atoms/link/atom-link.html',
	    		{},
	    		( a, b ) => { 
	    			expect(b).to.be.an('object')
	    			         .that.has.a.property('raw')
	    			         .that.is.not.empty;
	    			expect(b.raw).to.be.a('string')
	    			             .that.is.equal('<a class="{{class}}" href="{{href}}">{{label}}</a>');
	    			
	    			expect(b).to.be.an('object')
	    			         .that.has.a.property('highlight')
	    			         .that.is.not.empty;
	    			
	    			expect(b).to.be.an('object')
	    			         .that.has.a.property('escaped')
	    			         .that.is.not.empty;
	    			expect(b.escaped).to.be.a('string')
		                             .that.is.equal('&lt;a class=&quot;{{class}}&quot; href=&quot;{{href}}&quot;&gt;{{label}}&lt;/a&gt;');
	    			
	    			done(); 
	    		},
	    		null
	    	);
	    });

	    it('search method returns empty result', function () {
	    	
	    	let result = adapter.search();
	    	expect(result).to.be.empty;
	    });
	    
    });

	describe('Patternlibrary "example" adapter:', () => {
		
    	let adapter = require('../lib/adapters/example.js');
        /*let patternlibraryOptions = {
            verbose : false,
            dest    : FIXTURES + 'example/build',
            root    : FIXTURES + 'example/pages/',
            layouts : FIXTURES + 'example/layouts/',
            partials: FIXTURES + 'example/partials/',
            testing : true
        };
        var p = new Patternlibrary.Patternlibrary(patternlibraryOptions);*/
        var p = new Patternlibrary.Patternlibrary();

	    it('retrieves example\'s source-code from file', function (done) {
	    	
	    	adapter(
	    		'test/fixtures/adapters/example/partials/atoms/link/example.html',
	    		{},
	    		( a, b ) => { 
	    			expect(b).to.be.an('object')
	    			         .that.has.a.property('raw')
	    			         .that.is.not.empty;
	    			expect(b.raw).to.be.a('string')
	    			             .that.is.equal('<a href="/somewhere.html">anywhere</a>');
	    			
	    			expect(b).to.be.an('object')
	    			         .that.has.a.property('highlight')
	    			         .that.is.not.empty;
	    			
	    			expect(b).to.be.an('object')
	    			         .that.has.a.property('escaped')
	    			         .that.is.not.empty;
	    			expect(b.escaped).to.be.a('string')
		                             .that.is.equal('&lt;a href=&quot;/somewhere.html&quot;&gt;anywhere&lt;/a&gt;');
	    			
	    			done(); 
	    		},
	    		p
	    	);
	    });

	    it('returns flase if file is not readable/does not exist', function (done) {
	    	adapter(
	    		'test/fixtures/adapters/example/partials/atoms/link/example_not_found.html',
	    		{},
	    		( a, b ) => { 
	    			expect(b).to.equal(false);
	    			
	    			done(); 
	    		},
	    		p
	    	);
	    });

	    it('search method returns empty result', function () {
	    	
	    	let result = adapter.search();
	    	expect(result).to.be.empty;
	    });
	    
    });

	describe('Patternlibrary "sass" adapter:', () => {
		
    	let adapter = require('../lib/adapters/sass.js');
        var items;
        
	    it('retrieves sass\'s source-code from file', function (done) {
	    	
	    	adapter(
	    		'test/fixtures/adapters/example/partials/atoms/link/styles.scss',
	    		{},
	    		( a, b ) => { 
	    			expect(b).to.be.an('object')
	    			         .that.is.not.empty;

	    			items = b;
	    			done(); 
	    		},
	    		null
	    	);
	    });

	    it('search method returns an array with sourcecode items given', function () {
	    	
	    	let result = adapter.search(items);
	    	expect(result).to.be.an('array')
	                      .that.is.not.empty;
	    });

	    it('search method returns empty array with no sourcecode items list given', function () {
	    	
	    	let result = adapter.search({});
	    	expect(result).to.be.an('array')
                          .that.is.empty;
	    });
	    
    });

	describe('Patternlibrary "javascript" adapter:', () => {
		
    	let adapter = require('../lib/adapters/js.js');
        var items;
        
	    it('retrieves javascript\'s source-code from file', function (done) {
	    	
	    	adapter(
	    		'test/fixtures/adapters/example/partials/atoms/link/module.js',
	    		{},
	    		( a, b ) => { 
	    			expect(b).to.be.an('object')
	    			         .that.is.not.empty;

	    			items = b;
	    			done(); 
	    		},
	    		null
	    	);
	    });

	    it('search method returns an array with sourcecode items given', function () {
	    	
	    	let result = adapter.search(items);
	    	expect(result).to.be.an('array')
	                      .that.is.not.empty;
	    });

	    it('search method returns empty array with no sourcecode items list given', function () {
	    	
	    	let result = adapter.search({});
	    	expect(result).to.be.an('array')
                          .that.is.empty;
	    });

	    it('module has no defaults', function (done) {

	    	adapter(
	    		'test/fixtures/adapters/example/partials/atoms/link/module_no_defaults.js',
	    		{},
	    		( a, b ) => { 
	    			expect(b).to.be.an('object')
	    			         .that.is.not.empty;

	    			items = b;
	    			done(); 
	    		},
	    		null
	    	);
	    });
	    
    });

	describe('Patternlibrary "changelog" adapter:', () => {
		
    	let adapter = require('../lib/adapters/changelog.js');
        var p = new Patternlibrary.Patternlibrary();

	    it('retrieves example\'s source-code from file', function (done) {
	    	
	    	adapter(
	    		'test/fixtures/adapters/example/partials/atoms/link/changelog.md',
	    		{},
	    		( a, b ) => { 
	    			expect(b).to.be.a('string');
	    			
	    			done(); 
	    		},
	    		p
	    	);
	    });

	    it('returns flase if file is not readable/does not exist', function (done) {
	    	adapter(
	    		'test/fixtures/adapters/example/partials/atoms/link/changelog_not_found.md',
	    		{},
	    		( a, b ) => { 
	    			expect(b).to.equal(false);
	    			
	    			done(); 
	    		},
	    		p
	    	);
	    });

	    it('search method returns empty result', function () {
	    	
	    	let result = adapter.search();
	    	expect(result).to.be.empty;
	    });
	    
    });

	describe('Patternlibrary "tests" adapter:', () => {
		
    	let adapter = require('../lib/adapters/tests.js');

	    it('retrieves test-results from test-file', function (done) {
	    	
	    	adapter(
	    		'test/fixtures/adapters/example/partials/atoms/link/test.js',
	    		{},
	    		( a, b ) => { 
	    			expect(b).to.be.a('object');
	    			
	    			done(); 
	    		}
	    	);
	    });

	    it('returns flase if file is not readable/does not exist', function (done) {
	    	adapter(
	    		'test/fixtures/adapters/example/partials/atoms/link/test_not_found.js',
	    		{},
	    		( a, b ) => { 
	    			expect(b).to.equal(false);
	    			
	    			done(); 
	    		}
	    	);
	    });

	    it('search method returns empty result', function () {
	    	
	    	let result = adapter.search();
	    	expect(result).to.be.empty;
	    });
	    
    });

	describe('Patternlibrary "gitinfo" adapter:', () => {
		
    	let adapter = require('../lib/adapters/gitinfo.js');
        var p = new Patternlibrary.Patternlibrary();

	    it('retrieves git-info from file', function (done) {
	    	
	    	adapter(
	    		'test/fixtures/adapters/example/partials/atoms/link/atom-link.html',
	    		{},
	    		( a, b ) => { 
	    			expect(b).to.be.a('object');
	    			
	    			done(); 
	    		},
	    		p
	    	);
	    });

	    it('returns flase if file is not readable/does not exist', function (done) {
	    	adapter(
	    		'test/fixtures/adapters/example/partials/atoms/link/file_not_found.html',
	    		{},
	    		( a, b ) => { 
	    			expect(b).to.equal(false);
	    			
	    			done(); 
	    		},
	    		p
	    	);
	    });

	    it('search method returns empty result', function () {
	    	
	    	let result = adapter.search();
	    	expect(result).to.be.empty;
	    });
	    
    });
	
	
	/*
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
    */
});
