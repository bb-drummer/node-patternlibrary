import Patternlibrary from '..';

import fs from 'fs';
import equal from 'assert-dir-equal';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import sinon from 'sinon';
import jsonfile from 'jsonfile';

var expect = require('chai').expect;

describe('Utility functions:', function () {
	
	describe('"escape"', function () {

		var escape = require('../lib/util/escape.js');
		
		it('replaces whitespace with a dash character "-" ', function () {
			
			let result = escape("a space");
			expect(result).to.equal('a-space');
		});
		
		it('returns empty string if parameter is undefined', function () {

			let result = escape();
			expect(result).to.equal('');
		});
		
	});	
	
	describe('"git"', function () {

		var git = require('../lib/util/git.js');
		
		it('"git.log" retrieves git-log information for a given file', function () {

		    let result = git.log('./package.json');
			expect(result).not.to.be.empty;
			expect(String(result)).not.to.be.empty;
		});
		
		it('"git.log" retrieves formated git-log information for a given file', function () {
			
		    var logFormatCompact = 
			    '### %cd'+'%n'+
			    '%n'+
			    '- %s (%h, by [%an](mailto:%ae), <%ae>)'+'%n'+
			    '%n'+
			    '%n';

		    let result = git.log('./package.json',  'format:"'+logFormatCompact+'"');
			expect(result).not.to.be.empty;
			expect(String(result)).not.to.be.empty;
		});
		
		it('"git.log" retrieves git-log information for CWD if no file is given', function () {

		    let result = git.log();
			expect(result).not.to.be.empty;
			expect(String(result)).not.to.be.empty;
		});
		
	});	
	
	describe('"log"', function () {
		
		it('"log" method outputs console log info', function () {
			
			var p = new Patternlibrary.Patternlibrary({verbose: true});
		    var spyLog = sinon.spy(console, 'log');
			p.log.log('some log info...');
			expect( spyLog.called ).to.be.true;
		    expect( spyLog.getCall(0).args[0] ).to.contain('some log info...');
		    spyLog.restore();
		});
		
		it('"info" method outputs console info', function () {
			
			var p = new Patternlibrary.Patternlibrary({verbose: true});
		    var spyLog = sinon.spy(console, 'log');
			p.log.info('some more log info...');
			expect( spyLog.called ).to.be.true;
		    expect( spyLog.getCall(0).args[0] ).to.contain('some more log info...');
		    spyLog.restore();
		});
		
		it('"warn" method outputs console warning', function () {
			
			var p = new Patternlibrary.Patternlibrary({verbose: true});
		    var spyLog = sinon.spy(console, 'log');
			p.log.warn('this a warning...');
			expect( spyLog.called ).to.be.true;
		    expect( spyLog.getCall(0).args[0] ).to.contain('this a warning...');
		    spyLog.restore();
		});
		
		it('"warn" method outputs console warning with error information', function () {
			
			var p = new Patternlibrary.Patternlibrary({verbose: true});
		    var spyLog = sinon.spy(console, 'log');
			p.log.warn('this a warning...', {message: 'some error'});
			expect( spyLog.called ).to.be.true;
		    expect( spyLog.getCall(0).args[0] ).to.contain('this a warning...');
			expect( spyLog.getCall(1).args[0] ).to.contain('Patternlibrary Debug');
		    spyLog.restore();
		});
		
		it('"debug" method outputs console debug information', function () {
			
			var p = new Patternlibrary.Patternlibrary({verbose: true});
		    var spyLog = sinon.spy(console, 'log');
			p.log.debug({key: 'value'});
			expect( spyLog.called ).to.be.true;
			expect( spyLog.getCall(0).args[0] ).to.contain('Patternlibrary Debug');
		    expect( spyLog.getCall(1).args[0] ).to.have.a.property('key');
		    spyLog.restore();
		});
		
		it('"process" method outputs (file) process information', function () {
			
			var p = new Patternlibrary.Patternlibrary({verbose: true});
		    var spyLog = sinon.spy(console, 'log');
			p.log.process('some/file.name');
			expect( spyLog.called ).to.be.true;
			expect( spyLog.getCall(0).args[0] ).to.contain('Patternlibrary: processed');
			expect( spyLog.getCall(0).args[0] ).to.contain('some/file.name');
		    spyLog.restore();
		});
		
		it('"process" method outputs (file) process information with additional data', function () {
			
			var p = new Patternlibrary.Patternlibrary({verbose: true});
		    var spyLog = sinon.spy(console, 'log');
			p.log.process('some/file.name', 'more data');
			expect( spyLog.called ).to.be.true;
			expect( spyLog.getCall(0).args[0] ).to.contain('Patternlibrary: processed');
			expect( spyLog.getCall(0).args[0] ).to.contain('some/file.name');
			expect( spyLog.getCall(0).args[0] ).to.contain('more data');
		    spyLog.restore();
		});
		
		
		it('"process" method outputs (file) process information with special adapter data', function () {
			
			var p = new Patternlibrary.Patternlibrary({verbose: true});
		    var spyLog = sinon.spy(console, 'log');
			p.log.process('some/file.name', {_adapterData: {one: 'an adapter object', two: 'another adapter object'}});
			expect( spyLog.called ).to.be.true;
			expect( spyLog.getCall(0).args[0] ).to.contain('Patternlibrary: processed');
			expect( spyLog.getCall(0).args[0] ).to.contain('some/file.name');
			expect( spyLog.getCall(0).args[0] ).to.contain('one, two');
		    spyLog.restore();
		});
		
	});	
	
	describe('"module-or-process-path"', function () {
		
		it('resolves to module base path', function () {
			var moduleOrProcessPath = require('../lib/util/module-or-process-path.js');
			process.chdir('lib/util');
			var the_path = moduleOrProcessPath('package.json');
			
            expect(the_path).to.contain('../..');
			process.chdir('../..');
			
		});
		
	});	
	
	describe('"highlight-code"', function () {
		
		it('throws exception on error', function () {
			var highlightCode = require('../lib/util/highlight-code.js');

	        expect(function() { highlightCode('language_not_found_thorws_error', "<div bla... some code here!"); }).to.throw(Error);
			
		});
		
	});	
	
	describe('"filter-patterns"', function () {
		
		var patterns = jsonfile.readFileSync('test/data/patterns.json');
		var filterPatterns = require('../lib/util/filter-patterns.js');
		
		it('filters list of patterns by category', function () {

            var list = filterPatterns('atom', patterns);
            
            expect(list).to.be.an('object')
                        .and.to.have.a.property('atom/link');
			
		});
		
		it('returns the data itself if first parameter has an undefined value', function () {

            var list = filterPatterns(undefined, patterns);
            
            expect(list).to.be.an('object')
                        .and.to.deep.equal(patterns);
			
		});
		
	});	
	
	describe('"process-parameters"', function () {
		
		it('returns data ^^', function () {
			var processParameters = require('../lib/util/process-parameters.js');
			var data = {key: ' value'};
			var xpct = {key: ' value'};
			var result = processParameters({}, data);
			
	        expect(result).to.deep.equal(data);
			
		});
		
	});	
	
});