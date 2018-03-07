var hljs = require('./highlightjs');


function highlightCode(code, language) {
    if ( (typeof language === 'undefined') || (language == '') ) {
    	language = 'html';
    }
    var lang    = language.replace('_example', '');
    if (lang == '') {
    	lang == 'html';
    }
    var example = language != lang;
    
    var renderedCode = hljs.highlight(lang, code, true).value;
    
    var output = '<pre class="docs-code" data-docs-code><code class="'+lang+'">'+renderedCode+'</code></pre>';
    //var output = ''+renderedCode+'';
    if (example) {
    	output = '<pre class="hide hidden" style="display: none !important;"></pre>'
    		   + '<h3>Source</h3>'
    		   + '<pre class="docs-code" data-docs-code><code class="'+lang+'">'+renderedCode+'</code></pre>'
               + '<h3>Output</h3>'
    		   + '<div class="code-example">'+code+'</div>';
    }

    
    return output;
};
  

/**
 * 'markdown-it' instance with plugins
 * 
 * @var {markdownIt} $markdown
 */
var $markdown = require('markdown-it')({
	  html       : true,
	  linkify    : true,
	  typoprapher: true,
	  highlight  : highlightCode
	})
    .use(require("markdown-it-abbr"))
    .use(require("markdown-it-anchor"))
    .use(require("markdown-it-deflist"))
    .use(require("markdown-it-emoji"))
    .use(require("markdown-it-footnote"))
    //.use(require("markdown-it-pandoc-renderer"))
    .use(require("markdown-it-sub"))
    .use(require("markdown-it-sup"))
    .use(require("markdown-it-anchor"))
    .use(require("markdown-it-table-of-contents"), {
    	includeLevel: [ 1, 2, 3, 4, 5, 6 ]
    })
    .use(require("markdown-it-container"))
    .use(require("markdown-it-component"))
    .use(require("markdown-it-task-lists"))
    .use(require("markdown-it-fontawesome"))
;

module.exports = $markdown;