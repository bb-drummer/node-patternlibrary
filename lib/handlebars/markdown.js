var handlebars = require('handlebars');
var hljs = require('highlight.js');
var $markdown = require('../vendor/markdown-it');


function highlightCode(code, language) {
    if (typeof language === 'undefined') language = 'html';

    var renderedCode = hljs.highlight(language, code).value;
    var output = `<div class="code-example"><pre><code class="${language}">${renderedCode}</code></pre></div>`;

    return output;
};
  
function markdown(options) {

    return $markdown.render(options.fn(this));
}


/**
 * Handlebars block helper that converts Markdown to HTML.
 * The code blocks in the markdown are rendered with the syntax highlighting.
 * @param {object} options - Handlebars object.
 * @example
 * {{#markdown}}Welcome to [zombo.com](http://zombo.com){{/markdown}}
 * @returns The Markdown inside the helper, converted to HTML.
 */
handlebars.registerHelper('markdown', markdown);
module.exports = markdown;
