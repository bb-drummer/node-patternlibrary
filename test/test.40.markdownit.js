import Patternlibrary from '..';

import equal from 'assert-dir-equal';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';

var expect = require('chai').expect;
var $md = require('../lib/vendor/markdown-it.js');
var stripHtml = require('striptags');

describe('Markdown-It plugin helpers', function () {
	
	it('renders highlighted code block with given language', function () {
		
		let codeblock = ["```html_example", "\n",
		    '<div class="galaxy"><div>',
		"```"].join("\n");
		let result = $md.render(codeblock);
		
		console.log(result);
		expect(result).to.be.a('string');
	});
	
	it('renders highlighted code block with no language', function () {
		
		let codeblock = ["```", "\n",
		    '<div class="galaxy"><div>',
		"```"].join("\n");
		let result = $md.render(codeblock);
		
		console.log(result);
		expect(result).to.be.a('string');
	});
	
	it('renders highlighted code block with faulty indicator', function () {
		
		let codeblock = ["```_example", "\n",
		    '<div class="galaxy"><div>',
		"```"].join("\n");
		let result = $md.render(codeblock);
		
		console.log(result);
		expect(result).to.be.a('string');
	});
	
	
});